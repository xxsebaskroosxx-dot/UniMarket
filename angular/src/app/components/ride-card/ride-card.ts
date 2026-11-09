import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { RideService, Ride } from '../../services/ride';
import { TimeAgoPipe } from '../../pipes/time-ago-pipe';

@Component({
  imports: [TimeAgoPipe],
  selector: 'app-ride-card',
  styleUrl: './ride-card.css',
  templateUrl: './ride-card.html',
})
export class RideCard implements OnInit, OnChanges, OnDestroy {
  @Input() ride!: Ride;
  @Output() favoriteChange = new EventEmitter<{ id: number; isFavorite: boolean }>();
  @Output() delete = new EventEmitter<number>();

  private updateInterval: ReturnType<typeof setInterval> | undefined;
  timeLeft = 'Calculando...';
  isExpanded = false;

  constructor(private readonly rideService: RideService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ride'] && this.ride) {
      this.startCountdown();
    }
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  private startCountdown(): void {
    this.clearCountdown();

    const [rideHours, rideMinutes] = this.ride.time.split(':').map(Number);
    if (!Number.isInteger(rideHours) || !Number.isInteger(rideMinutes)) {
      this.timeLeft = 'Hora no válida';
      return;
    }

    const now = new Date();
    const rideTime = new Date();
    rideTime.setHours(rideHours, rideMinutes, 0, 0);
    if (rideTime <= now) rideTime.setDate(rideTime.getDate() + 1);

    const update = (): void => {
      const difference = rideTime.getTime() - Date.now();
      if (difference <= 0) {
        this.timeLeft = '¡Ya salió!';
        this.clearCountdown();
        return;
      }

      const totalMinutes = Math.floor(difference / 60_000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      this.timeLeft = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${Math.floor((difference % 60_000) / 1000)}s`;
    };

    update();
    this.updateInterval = setInterval(update, 1000);
  }

  private clearCountdown(): void {
    if (this.updateInterval !== undefined) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  get isFavorite(): boolean {
    return this.ride.isFavorite ?? false;
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.ride.price);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    const isFavorite = this.rideService.toggleFavorite(this.ride.id, this.isFavorite);
    this.favoriteChange.emit({ id: this.ride.id, isFavorite });
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  deleteRide(event: Event): void {
    event.stopPropagation();
    if (confirm(`¿Eliminar viaje de ${this.ride.driver}?`)) {
      this.delete.emit(this.ride.id);
    }
  }
}