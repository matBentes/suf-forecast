import { StormGlass } from '@src/clients/stormGlass';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormGlass_normalized_response_3_hours.json';
import {
  Forecast,
  ForecastProcessingInternalError,
} from '@src/services/forecast';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import { BeachPosition, Beach } from '@src/models/beach';

describe('Forecast Service', () => {
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;
  it('should return the forecast for a lista of beaches', async () => {
    mockedStormGlassService.fetchPoints = jest
      .fn()
      .mockResolvedValue(stormGlassNormalizedResponseFixture);
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    const forecast = new Forecast(mockedStormGlassService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return an empty list when the beaches array is empty', async () => {
    const forecast = new Forecast();
    const response = await forecast.processForecastForBeaches([]);
    expect(response).toEqual([]);
  });

  it('should throw internal processing erorr when something goes wrong during the rating process', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'fake-id',
      },
    ];

    mockedStormGlassService.fetchPoints.mockRejectedValue(
      'Error fetching data'
    );
    const forecast = new Forecast(mockedStormGlassService);
    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });
});
