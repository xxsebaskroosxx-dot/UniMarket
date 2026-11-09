import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Conversation, Message } from '../models/conversation';
import { Product } from '../models/product';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
}

interface ProductRow {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  state: string;
  listing_type: 'Venta' | 'Intercambio' | null;
  trade_wishlist: string | null;
  images: string[];
  description: string | null;
  owner_id: string;
}

interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
}

interface ConversationRow {
  id: string;
  participant_one: string;
  participant_two: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  readonly isConfigured = Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
  private readonly supabase: SupabaseClient | null = this.isConfigured
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        global: { fetch: (input, init) => this.fetchWithTimeout(input, init) },
      })
    : null;

  private fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), 20_000);
    const requestSignal = init?.signal;
    const relayAbort = (): void => controller.abort(requestSignal?.reason);

    if (requestSignal?.aborted) relayAbort();
    else requestSignal?.addEventListener('abort', relayAbort, { once: true });

    return fetch(input, { ...init, signal: controller.signal })
      .catch((error: unknown) => {
        if (controller.signal.aborted && !requestSignal?.aborted) {
          throw new Error('La solicitud al servidor tardó demasiado. Revisa tu conexión e inténtalo de nuevo.');
        }
        throw error;
      })
      .finally(() => {
        globalThis.clearTimeout(timeoutId);
        requestSignal?.removeEventListener('abort', relayAbort);
      });
  }

  private async withRequestTimeout<T>(request: PromiseLike<T>, action: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = globalThis.setTimeout(() => {
        reject(new Error(`Supabase no respondió al intentar ${action} en 12 segundos. Comprueba tu conexión y vuelve a cargar la página antes de intentarlo otra vez.`));
      }, 12_000);
    });

    try {
      return await Promise.race([request, timeout]);
    } finally {
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
    }
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.client().auth.getSession();
    if (error) throw error;
    return data.session ? this.getProfile(data.session.user.id) : null;
  }

  onAuthStateChange(callback: (userId: string | null, event: string) => void): () => void {
    const { data } = this.client().auth.onAuthStateChange((event, session) => {
      callback(session?.user.id ?? null, event);
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp(email: string, password: string, fullName: string, username: string): Promise<boolean> {
    const { data, error } = await this.client().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username } },
    });
    if (error) throw error;
    return !data.session;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client().auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.client().auth.updateUser({ password });
    if (error) throw error;
  }

  async searchUsers(term: string, currentUserId: string): Promise<UserProfile[]> {
    const { data, error } = await this.client()
      .from('profiles')
      .select('id, username, full_name, role')
      .ilike('username', `%${term}%`)
      .neq('id', currentUserId)
      .order('username')
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((row) => this.toProfile(row as ProfileRow));
  }

  async loadProducts(): Promise<Product[]> {
    const { data, error } = await this.client()
      .from('products')
      .select('id, name, price, category, emoji, state, listing_type, trade_wishlist, images, description, owner_id')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as ProductRow[];
    const ownerIds = [...new Set(rows.map((row) => row.owner_id))];
    const profiles = ownerIds.length
      ? await this.client().from('profiles').select('id, username, full_name').in('id', ownerIds)
      : { data: [], error: null };
    if (profiles.error) throw profiles.error;
    const usernames = new Map((profiles.data ?? []).map((profile) => [profile.id, profile.username]));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      category: row.category,
      emoji: row.emoji,
      state: row.state,
      listingType: row.listing_type ?? 'Venta',
      tradeWishlist: row.trade_wishlist ?? undefined,
      images: row.images ?? [],
      description: row.description ?? undefined,
      ownerId: row.owner_id,
      ownerUsername: usernames.get(row.owner_id) ?? 'usuario',
    }));
  }

  async publishProduct(
    product: Omit<Product, 'id' | 'ownerId' | 'ownerUsername' | 'images'>,
    imageFiles: File[],
    ownerId: string,
  ): Promise<Product> {
    const client = this.client();
    const imageUrls = await Promise.all(imageFiles.map(async (file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await client.storage.from('product-images').upload(path, file, { upsert: false });
      if (error) throw error;
      return client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }));

    const { data, error } = await client
      .from('products')
      .insert({
        owner_id: ownerId,
        name: product.name,
        price: product.price,
        category: product.category,
        emoji: product.emoji,
        state: product.state,
        listing_type: product.listingType ?? 'Venta',
        trade_wishlist: product.tradeWishlist ?? null,
        description: product.description ?? null,
        images: imageUrls,
      })
      .select('id, name, price, category, emoji, state, listing_type, trade_wishlist, images, description, owner_id')
      .single();
    if (error) throw error;
    return {
      ...product,
      id: data.id,
      images: data.images ?? [],
      ownerId: data.owner_id,
    };
  }

  async deleteProduct(productId: number): Promise<void> {
    const { data, error } = await this.client()
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new Error('No se eliminó la publicación. Verifica que tu cuenta tenga permisos para borrarla y que la migración de administrador esté aplicada en Supabase.');
    }
  }

  async updateProduct(
    productId: number,
    changes: Pick<Product, 'name' | 'price' | 'category' | 'description' | 'state' | 'listingType' | 'tradeWishlist'>,
  ): Promise<void> {
    const request = this.client()
      .from('products')
      .update({
        name: changes.name,
        price: changes.price,
        category: changes.category,
        description: changes.description ?? null,
        state: changes.state,
        listing_type: changes.listingType ?? 'Venta',
        trade_wishlist: changes.tradeWishlist ?? null,
      })
      .eq('id', productId)
      .select('id')
      .maybeSingle();
    const { data, error } = await this.withRequestTimeout(request, 'guardar los cambios de la publicación');
    if (error) throw error;
    if (!data) {
      throw new Error('Supabase no actualizó ninguna fila. Ejecuta angular/supabase/admin-role-migration.sql en el SQL Editor de Supabase y confirma que la publicación te pertenece o que tu cuenta está configurada como administradora.');
    }
  }

  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const { data, error } = await this.client().rpc('get_or_create_conversation', {
      other_user_id: otherUserId,
    });
    if (error) throw error;
    return data;
  }

  async loadConversations(currentUserId: string): Promise<Conversation[]> {
    const { data, error } = await this.client()
      .from('conversations')
      .select('id, participant_one, participant_two, updated_at')
      .or(`participant_one.eq.${currentUserId},participant_two.eq.${currentUserId}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as ConversationRow[];
    if (!rows.length) return [];

    const otherUserIds = rows.map((row) =>
      row.participant_one === currentUserId ? row.participant_two : row.participant_one,
    );
    const [profilesResult, messagesResult] = await Promise.all([
      this.client().from('profiles').select('id, username, full_name, role').in('id', otherUserIds),
      this.client()
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .in('conversation_id', rows.map((row) => row.id))
        .order('created_at', { ascending: false }),
    ]);
    if (profilesResult.error) throw profilesResult.error;
    if (messagesResult.error) throw messagesResult.error;

    const profiles = new Map((profilesResult.data ?? []).map((profile) => [
      profile.id,
      this.toProfile(profile as ProfileRow),
    ]));
    const lastMessages = new Map<string, MessageRow>();
    for (const message of (messagesResult.data ?? []) as MessageRow[]) {
      if (!lastMessages.has(message.conversation_id)) lastMessages.set(message.conversation_id, message);
    }

    return rows.map((row) => {
      const otherUserId = row.participant_one === currentUserId ? row.participant_two : row.participant_one;
      const profile = profiles.get(otherUserId);
      const message = lastMessages.get(row.id);
      return {
        id: row.id,
        otherUserId,
        name: profile?.username ?? 'Usuario',
        avatar: (profile?.username ?? '?').slice(0, 1).toUpperCase(),
        status: 'Conversación',
        messages: message ? [this.toMessage(message, currentUserId)] : [],
      };
    });
  }

  async loadMessages(conversationId: string, currentUserId: string): Promise<Message[]> {
    const { data, error } = await this.client()
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at');
    if (error) throw error;
    return ((data ?? []) as MessageRow[]).map((row) => this.toMessage(row, currentUserId));
  }

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
    const { error } = await this.client().from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: text,
    });
    if (error) throw error;
  }

  subscribeToMessages(conversationId: string, callback: (error?: Error) => void): () => void {
    const channel = this.client()
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        () => callback(),
      )
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          callback(error ?? new Error(`No se pudo conectar al chat en tiempo real (${status}).`));
        }
      });
    return () => {
      void this.client().removeChannel(channel);
    };
  }

  private async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.client()
      .from('profiles')
      .select('id, username, full_name, role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return this.toProfile(data as ProfileRow);
  }

  private toProfile(row: ProfileRow): UserProfile {
    return { id: row.id, username: row.username, fullName: row.full_name, role: row.role };
  }

  private toMessage(row: MessageRow, currentUserId: string): Message {
    return {
      id: row.id,
      sender: row.sender_id === currentUserId ? 'me' : 'them',
      text: row.content,
      createdAt: row.created_at,
    };
  }

  private client(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Configura la URL y la clave pública de Supabase en src/environments/environment.ts.');
    }
    return this.supabase;
  }
}
