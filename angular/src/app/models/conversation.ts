export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  name: string;
  avatar: string;
  status: string;
  messages: Message[];
}
