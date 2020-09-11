import { Beach, GeoPosition } from '@src/models/beach';
import { ForecastPoint } from '@src/clients/stormGlass';

const waveHeights = {
  angleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};
export class Rating {
  constructor(private beach: Beach) {}

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingforSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;

    return Math.round(finalRating);
  }

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition === windPosition) return 1;
    if (this.isWindOffShore(wavePosition, windPosition)) return 5;
    return 3;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return GeoPosition.N;
    }

    if (coordinates >= 50 && coordinates < 120) {
      return GeoPosition.E;
    }

    if (coordinates >= 120 && coordinates < 220) {
      return GeoPosition.S;
    }

    if (coordinates >= 220 && coordinates < 310) {
      return GeoPosition.W;
    }

    return GeoPosition.E;
  }

  private isWindOffShore(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): boolean {
    return (
      (wavePosition === GeoPosition.N &&
        windPosition === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (wavePosition === GeoPosition.S &&
        windPosition === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (wavePosition === GeoPosition.E &&
        windPosition === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (wavePosition === GeoPosition.W &&
        windPosition === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    );
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) {
      return 2;
    }

    if (period >= 10 && period < 14) {
      return 4;
    }

    if (period >= 14) {
      return 5;
    }

    return 1;
  }

  public getRatingforSwellSize(swellHeight: number): number {
    if (
      swellHeight >= waveHeights.angleToKnee.min &&
      swellHeight < waveHeights.angleToKnee.max
    ) {
      return 2;
    }

    if (
      swellHeight >= waveHeights.waistHigh.min &&
      swellHeight < waveHeights.waistHigh.max
    ) {
      return 3;
    }

    if (swellHeight >= waveHeights.headHigh.min) {
      return 5;
    }

    return 1;
  }
}
