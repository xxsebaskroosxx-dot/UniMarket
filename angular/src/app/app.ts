import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesSectionComponent } from './components/categories-section/categories-section';
import { FavoritesSectionComponent } from './components/favorites-section/favorites-section';
import { HomeSectionComponent } from './components/home-section/home-section';
import { HelpSectionComponent } from './components/help-section/help-section';
import { LoginFormComponent } from './components/login-form/login-form';
import { MessagesSectionComponent } from './components/messages-section/messages-section';
import { MyListingsSectionComponent } from './components/my-listings-section/my-listings-section';
import { NotificationsSectionComponent } from './components/notifications-section/notifications-section';
import { ProfileSectionComponent } from './components/profile-section/profile-section';
import { SettingsSectionComponent } from './components/settings-section/settings-section';
import { SidebarComponent } from './components/sidebar/sidebar';
import { Conversation } from './models/conversation';
import { Product } from './models/product';
import { MarketplaceService, UserProfile } from './services/marketplace';
import { ProductSortOption, strategyFor } from './strategies/product-sort.strategy';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    CategoriesSectionComponent,
    FavoritesSectionComponent,
    HomeSectionComponent,
    LoginFormComponent,
    MessagesSectionComponent,
    MyListingsSectionComponent,
    NotificationsSectionComponent,
    ProfileSectionComponent,
    SettingsSectionComponent,
    HelpSectionComponent,
    SidebarComponent,
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private readonly marketplace = inject(MarketplaceService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly categories = ['Libros', 'Electrónica', 'Ropa', 'Papelería', 'Muebles', 'Deportes', 'Otros'];
  readonly categoryIcons = ['📖', '💻', '👕', '✏️', '🛋️', '⚽', '•••'];
  readonly navigation = [
    { id: 'ayuda', icon: '?', label: 'Ayuda y seguridad' },
    { id: 'inicio', icon: '⌂', label: 'Inicio' },
    { id: 'categorias', icon: '▦', label: 'Categorías' },
    { id: 'publicaciones', icon: '▤', label: 'Mis publicaciones' },
    { id: 'favoritos', icon: '♡', label: 'Favoritos' },
    { id: 'mensajes', icon: '◌', label: 'Mensajes' },
    { id: 'notificaciones', icon: '♧', label: 'Notificaciones', badge: '2' },
    { id: 'perfil', icon: '♙', label: 'Mi perfil' },
    { id: 'configuracion', icon: '⚙', label: 'Configuración' },
  ];
  readonly supabaseConfigured = this.marketplace.isConfigured;
  products: Product[] = [];
  conversations: Conversation[] = [];

  activeSection = 'inicio';
  activeChat = 0;
  mobileMenuOpen = false;
  activeCategory = '';
  searchTerm = '';
  sortOption: ProductSortOption = 'recent';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  favorites: number[] = [];
  darkMode = false;
  privateProfile = false;
  loggedUser = '';
  currentUserId = '';
  currentUserRole: 'admin' | 'user' = 'user';
  loginUser = '';
  loginPassword = '';
  loginError = '';
  loginErrorSuccess = false;
  passwordRecovery = false;
  recoveryPassword = '';
  recoveryPasswordConfirmation = '';
  showPassword = false;
  registerOpen = false;
  publishOpen = false;
  editingProduct: Product | null = null;
  selectedProduct: Product | null = null;
  selectedImageIndex = 0;
  registerName = '';
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  newName = '';
  newPrice: number | null = null;
  newCategory = this.categories[0];
  newDescription = '';
  newState: Product['state'] = 'Publicado';
  newListingType: Product['listingType'] = 'Venta';
  newTradeWishlist = '';
  newProductImages: string[] = [];
  publishError = '';
  chatInput = '';
  chatSearchTerm = '';
  searchResults: UserProfile[] = [];
  chatError = '';
  dataError = '';
  sendingMessage = false;
  publishing = false;
  private newProductFiles: File[] = [];
  private unsubscribeAuth?: () => void;
  private unsubscribeMessages?: () => void;
  deletingProduct = false;
  savingProductChanges = false;
  productDeleteError = '';
  productSaveSuccess = '';
  private subscribedConversationId = '';

  ngOnInit(): void {
    this.favorites = this.readNumberArray('unimarketFavorites');
    this.darkMode = localStorage.getItem('unimarketDarkMode') === 'true';
    this.privateProfile = localStorage.getItem('unimarketPrivateProfile') === 'true';
    this.applyDarkMode();
    if (!this.supabaseConfigured) return;

    this.unsubscribeAuth = this.marketplace.onAuthStateChange((_userId, event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this.passwordRecovery = true;
        this.loginError = '';
        this.loginErrorSuccess = false;
      }
      void this.syncCurrentUser();
    });
    void this.syncCurrentUser();
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth?.();
    this.unsubscribeMessages?.();
    document.body.classList.remove('dark-mode');
  }

  get visibleProducts(): Product[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const filteredProducts = this.products.filter((product) => {
      const matchesTerm = !term || product.name.toLocaleLowerCase().includes(term) || product.category.toLocaleLowerCase().includes(term);
      const matchesCategory = !this.activeCategory || product.category === this.activeCategory;
      const matchesMinPrice = this.minPrice === null || product.price >= this.minPrice;
      const matchesMaxPrice = this.maxPrice === null || product.price <= this.maxPrice;
      return matchesTerm && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
    return strategyFor(this.sortOption).sort(filteredProducts);
  }

  get favoriteProducts(): Product[] {
    return this.products.filter((product) => this.favorites.includes(product.id));
  }

  get myProducts(): Product[] {
    return this.currentUserRole === 'admin'
      ? this.products
      : this.products.filter((product) => product.ownerId === this.currentUserId);
  }

  showSection(id: string): void {
    this.activeSection = id;
    this.mobileMenuOpen = false;
    if (id !== 'categorias') this.activeCategory = '';
  }

  filterCategory(category: string): void {
    this.activeCategory = category;
    this.showSection('categorias');
    this.activeCategory = category;
  }

  openProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.selectedImageIndex = 0;
  }

  nextProductImage(): void {
    const images = this.selectedProduct?.images ?? [];
    if (images.length > 1) this.selectedImageIndex = (this.selectedImageIndex + 1) % images.length;
  }

  previousProductImage(): void {
    const images = this.selectedProduct?.images ?? [];
    if (images.length > 1) this.selectedImageIndex = (this.selectedImageIndex - 1 + images.length) % images.length;
  }

  clearPriceFilter(): void {
    this.minPrice = null;
    this.maxPrice = null;
  }

  openNewProductForm(): void {
    this.resetProductForm();
    this.publishOpen = true;
  }

  closeProductForm(): void {
    this.publishOpen = false;
    this.resetProductForm();
  }

  editSelectedProduct(): void {
    const product = this.selectedProduct;
    if (!product || (this.currentUserRole !== 'admin' && product.ownerId !== this.currentUserId)) return;

    this.editingProduct = product;
    this.newName = product.name;
    this.newPrice = product.price;
    this.newCategory = product.category;
    this.newDescription = product.description ?? '';
    this.newState = product.state;
    this.newListingType = product.listingType ?? 'Venta';
    this.newTradeWishlist = product.tradeWishlist ?? '';
    this.newProductFiles = [];
    this.newProductImages = product.images ?? [];
    this.publishError = '';
    this.selectedProduct = null;
    this.productSaveSuccess = '';
    this.publishOpen = true;
  }

  closeProductDetails(): void {
    this.selectedProduct = null;
    this.selectedImageIndex = 0;
    this.productDeleteError = '';
    this.productSaveSuccess = '';
  }

  async deleteSelectedProduct(): Promise<void> {
    const product = this.selectedProduct;
    if (!product || (this.currentUserRole !== 'admin' && product.ownerId !== this.currentUserId)) return;
    if (!window.confirm(`¿Seguro que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;

    this.deletingProduct = true;
    this.productDeleteError = '';
    try {
      await this.marketplace.deleteProduct(product.id);
      this.products = this.products.filter((item) => item.id !== product.id);
      this.favorites = this.favorites.filter((id) => id !== product.id);
      localStorage.setItem('unimarketFavorites', JSON.stringify(this.favorites));
      this.closeProductDetails();
    } catch (error) {
      this.productDeleteError = this.messageFor(error);
    } finally {
      this.deletingProduct = false;
      this.changeDetector.markForCheck();
    }
  }

  private resetProductForm(): void {
    this.editingProduct = null;
    this.newName = '';
    this.newPrice = null;
    this.newCategory = this.categories[0];
    this.newDescription = '';
    this.newState = 'Publicado';
    this.newListingType = 'Venta';
    this.newTradeWishlist = '';
    this.newProductFiles = [];
    this.newProductImages = [];
    this.publishError = '';
  }

  async messageSelectedSeller(): Promise<void> {
    const product = this.selectedProduct;
    if (!product?.ownerId) return;
    this.closeProductDetails();
    await this.openConversation(product.ownerId);
  }

  toggleFavorite(id: number): void {
    this.favorites = this.favorites.includes(id)
      ? this.favorites.filter((favorite) => favorite !== id)
      : [...this.favorites, id];
    localStorage.setItem('unimarketFavorites', JSON.stringify(this.favorites));
  }

  toggleDarkMode(enabled: boolean): void {
    this.darkMode = enabled;
    localStorage.setItem('unimarketDarkMode', String(enabled));
    this.applyDarkMode();
  }

  togglePrivacy(enabled: boolean): void {
    this.privateProfile = enabled;
    localStorage.setItem('unimarketPrivateProfile', String(enabled));
  }

  async selectChat(index: number): Promise<void> {
    this.activeChat = index;
    const conversation = this.conversations[index];
    if (conversation) await this.loadSelectedMessages(conversation);
  }

  async searchUsers(): Promise<void> {
    const term = this.chatSearchTerm.trim();
    this.chatError = '';
    this.searchResults = [];
    if (term.length < 2) {
      this.chatError = 'Escribe al menos 2 caracteres para buscar personas.';
      return;
    }
    try {
      this.searchResults = await this.marketplace.searchUsers(term, this.currentUserId);
      if (!this.searchResults.length) this.chatError = 'No se encontraron personas con ese usuario.';
    } catch (error) {
      this.chatError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async startConversation(otherUserId: string): Promise<void> {
    this.chatError = '';
    try {
      const conversationId = await this.marketplace.getOrCreateConversation(otherUserId);
      await this.loadConversations(conversationId);
      this.searchResults = [];
      this.chatSearchTerm = '';
      this.showSection('mensajes');
    } catch (error) {
      this.chatError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.chatInput.trim();
    const conversation = this.conversations[this.activeChat];
    if (!text || !conversation || this.sendingMessage) return;

    this.sendingMessage = true;
    this.chatError = '';
    try {
      await this.marketplace.sendMessage(conversation.id, this.currentUserId, text);
      this.chatInput = '';
      await this.loadConversations(conversation.id);
    } catch (error) {
      this.chatError = this.messageFor(error);
    } finally {
      this.sendingMessage = false;
      this.changeDetector.markForCheck();
    }
  }

  async openConversation(userId: string): Promise<void> {
    await this.startConversation(userId);
  }

  async onImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));
    try {
      this.newProductFiles = files;
      this.newProductImages = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error(`No se pudo leer ${file.name}.`));
        reader.readAsDataURL(file);
      })));
      this.publishError = '';
    } catch (error) {
      this.publishError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async publishProduct(): Promise<void> {
    if (this.publishing || this.savingProductChanges) return;
    if (!this.newName.trim() || !this.newPrice || this.newPrice <= 0) {
      this.publishError = 'Ingresa el nombre del producto y un precio válido.';
      return;
    }
    if (this.editingProduct) {
      await this.saveProductChanges();
      return;
    }

    this.publishing = true;
    this.publishError = '';
    try {
      const product = await this.marketplace.publishProduct({
        name: this.newName.trim(),
        price: this.newPrice,
        category: this.newCategory,
        emoji: '📦',
        state: 'Publicado',
        listingType: this.newListingType,
        tradeWishlist: this.newListingType === 'Intercambio' ? this.newTradeWishlist.trim() || undefined : undefined,
        description: this.newDescription.trim() || undefined,
      }, this.newProductFiles, this.currentUserId);
      this.products = [product, ...this.products];
      this.newName = '';
      this.newPrice = null;
      this.newCategory = this.categories[0];
      this.newDescription = '';
      this.newProductFiles = [];
      this.newProductImages = [];
      this.publishOpen = false;
      this.showSection('inicio');
    } catch (error) {
      this.publishError = this.messageFor(error);
    } finally {
      this.publishing = false;
      this.changeDetector.markForCheck();
    }
  }

  private async saveProductChanges(): Promise<void> {
    const product = this.editingProduct;
    const price = this.newPrice;
    if (
      !product ||
      !price ||
      price <= 0 ||
      (this.currentUserRole !== 'admin' && product.ownerId !== this.currentUserId)
    ) return;

    this.savingProductChanges = true;
    this.publishError = '';
    try {
      const updated: Product = {
        ...product,
        name: this.newName.trim(),
        price,
        category: this.newCategory,
        description: this.newDescription.trim() || undefined,
        state: this.newState,
        listingType: this.newListingType,
        tradeWishlist: this.newListingType === 'Intercambio' ? this.newTradeWishlist.trim() || undefined : undefined,
      };
      await this.marketplace.updateProduct(product.id, updated);
      this.products = this.products.map((item) => item.id === product.id ? updated : item);
      this.editingProduct = null;
      this.publishOpen = false;
      this.resetProductForm();
      this.selectedProduct = updated;
      this.productSaveSuccess = 'Cambios guardados correctamente.';
    } catch (error) {
      const message = this.messageFor(error);
      this.publishError = /row.level security|permission denied|42501/i.test(message)
        ? 'Supabase bloqueó el guardado por permisos. Ejecuta supabase/admin-role-migration.sql en el SQL Editor de Supabase y vuelve a iniciar sesión.'
        : message;
    } finally {
      this.savingProductChanges = false;
      this.changeDetector.detectChanges();
    }
  }

  async login(): Promise<void> {
    this.loginError = '';
    this.loginErrorSuccess = false;
    try {
      await this.marketplace.signIn(this.loginUser.trim(), this.loginPassword);
    } catch (error) {
      this.loginError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async logout(): Promise<void> {
    this.loginError = '';
    try {
      await this.marketplace.signOut();
    } catch (error) {
      this.loginError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.loginUser.trim()) {
      this.loginError = 'Escribe tu correo electrónico para enviarte el enlace.';
      this.loginErrorSuccess = false;
      return;
    }
    try {
      await this.marketplace.resetPassword(this.loginUser.trim());
      this.loginError = 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.';
      this.loginErrorSuccess = true;
    } catch (error) {
      this.loginError = this.messageFor(error);
      this.loginErrorSuccess = false;
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async saveRecoveredPassword(): Promise<void> {
    this.loginError = '';
    this.loginErrorSuccess = false;
    if (this.recoveryPassword.length < 6) {
      this.loginError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.recoveryPassword !== this.recoveryPasswordConfirmation) {
      this.loginError = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      await this.marketplace.updatePassword(this.recoveryPassword);
      await this.marketplace.signOut();
      this.setCurrentProfile(null);
      this.passwordRecovery = false;
      this.recoveryPassword = '';
      this.recoveryPasswordConfirmation = '';
      this.loginError = 'Contraseña actualizada. Ya puedes iniciar sesión.';
      this.loginErrorSuccess = true;
    } catch (error) {
      this.loginError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  async register(): Promise<void> {
    if (!this.registerName.trim() || !this.registerUsername.trim() || !this.registerEmail.trim() || !this.registerPassword || !this.registerConfirmPassword) {
      this.loginError = 'Completa todos los campos.';
      this.loginErrorSuccess = false;
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(this.registerUsername.trim())) {
      this.loginError = 'El usuario debe tener entre 3 y 24 caracteres: letras, números o guion bajo.';
      this.loginErrorSuccess = false;
      return;
    }
    if (this.registerPassword.length < 6) {
      this.loginError = 'La contraseña debe tener al menos 6 caracteres.';
      this.loginErrorSuccess = false;
      return;
    }
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.loginError = 'Las contraseñas no coinciden.';
      this.loginErrorSuccess = false;
      return;
    }
    try {
      const confirmationRequired = await this.marketplace.signUp(
        this.registerEmail.trim(),
        this.registerPassword,
        this.registerName.trim(),
        this.registerUsername.trim(),
      );
      this.registerOpen = false;
      this.registerPassword = '';
      this.registerConfirmPassword = '';
      this.loginError = confirmationRequired
        ? 'Cuenta creada. Revisa tu correo y confirma la cuenta antes de iniciar sesión.'
        : 'Cuenta creada. Ya puedes empezar a usar UniMarket.';
      this.loginErrorSuccess = true;
    } catch (error) {
      this.loginError = this.messageFor(error);
      this.loginErrorSuccess = false;
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  private async syncCurrentUser(): Promise<void> {
    try {
      const profile = await this.marketplace.getCurrentProfile();
      this.setCurrentProfile(profile);
    } catch (error) {
      const message = this.messageFor(error);
      if (this.loggedUser) this.dataError = message;
      else this.loginError = message;
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  private setCurrentProfile(profile: UserProfile | null): void {
    if (profile?.id === this.currentUserId) return;
    this.unsubscribeMessages?.();
    this.unsubscribeMessages = undefined;
    this.subscribedConversationId = '';
    this.currentUserId = profile?.id ?? '';
    this.loggedUser = profile?.username ?? '';
    this.currentUserRole = profile?.role ?? 'user';
    if (!profile) {
      this.products = [];
      this.conversations = [];
      this.dataError = '';
      return;
    }
    void Promise.all([this.refreshProducts(), this.loadConversations()]);
  }

  private async refreshProducts(): Promise<void> {
    try {
      this.products = await this.marketplace.loadProducts();
      this.dataError = '';
    } catch (error) {
      this.dataError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  private async loadConversations(preferredId?: string): Promise<void> {
    try {
      const previousId = preferredId ?? this.conversations[this.activeChat]?.id;
      this.conversations = await this.marketplace.loadConversations(this.currentUserId);
      const preferredIndex = this.conversations.findIndex((conversation) => conversation.id === previousId);
      this.activeChat = preferredIndex >= 0 ? preferredIndex : Math.min(this.activeChat, Math.max(this.conversations.length - 1, 0));
      const selected = this.conversations[this.activeChat];
      if (selected) await this.loadSelectedMessages(selected);
      this.dataError = '';
    } catch (error) {
      this.chatError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  private async loadSelectedMessages(conversation: Conversation): Promise<void> {
    if (this.subscribedConversationId !== conversation.id) {
      this.unsubscribeMessages?.();
      this.subscribedConversationId = conversation.id;
      this.unsubscribeMessages = this.marketplace.subscribeToMessages(conversation.id, (error) => {
        if (error) {
          this.chatError = error.message;
          this.changeDetector.markForCheck();
          return;
        }
        void this.loadConversations(conversation.id);
      });
    }
    await this.refreshSelectedMessages(conversation);
  }

  private async refreshSelectedMessages(conversation: Conversation): Promise<void> {
    try {
      const messages = await this.marketplace.loadMessages(conversation.id, this.currentUserId);
      const current = this.conversations.find((item) => item.id === conversation.id);
      if (current) current.messages = messages;
      this.chatError = '';
    } catch (error) {
      this.chatError = this.messageFor(error);
    } finally {
      this.changeDetector.markForCheck();
    }
  }

  private applyDarkMode(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  private readNumberArray(key: string): number[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : [];
    } catch {
      return [];
    }
  }

  private messageFor(error: unknown): string {
    if (error && typeof error === 'object') {
      const maybeStatus = 'status' in error ? Number((error as { status?: number }).status) : undefined;
      const maybeMessage = 'message' in error ? String((error as { message?: string }).message ?? '') : '';
      const normalized = maybeMessage.toLowerCase();

      if (maybeStatus === 429 || normalized.includes('rate limit') || normalized.includes('too many requests')) {
        return 'El proyecto de Supabase está temporalmente bloqueando el envío de correos por demasiados intentos. Espera unos minutos y vuelve a intentarlo o usa otro correo.';
      }

      if (normalized.includes('user already registered') || normalized.includes('already registered')) {
        return 'Este correo ya está registrado en UniMarket.';
      }

      if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
        return 'Las credenciales no son válidas. Verifica tu correo y contraseña.';
      }

      if (normalized.includes('email') && normalized.includes('confirm')) {
        return 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.';
      }

      if (maybeMessage) return maybeMessage;
    }

    if (error instanceof Error) return error.message;
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}
