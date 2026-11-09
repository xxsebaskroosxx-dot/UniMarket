import { Injectable } from '@angular/core';

export interface Ride {
  id: number;
  driver: string;
  time: string;
  price: number;
  isFavorite?: boolean;
  createdAt?: Date | string;
}

@Injectable({ providedIn: 'root' })
export class RideService {
  private readonly favorites = new Map<number, boolean>();

  toggleFavorite(id: number, currentState = false): boolean {
    const nextState = !(this.favorites.get(id) ?? currentState);
    this.favorites.set(id, nextState);
    return nextState;
  }
}