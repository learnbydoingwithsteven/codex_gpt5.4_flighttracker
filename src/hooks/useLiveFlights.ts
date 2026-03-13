import { startTransition, useEffect, useState } from "react";
import { fetchOpenSkyFlights } from "../services/opensky";
import type { FlightBounds, FlightRecord } from "../types/flight";

const POLL_INTERVAL_MS = 12000;

interface LiveFlightsState {
  flights: FlightRecord[];
  totalMatching: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastSuccessfulFetchMs: number | null;
}

const initialState: LiveFlightsState = {
  flights: [],
  totalMatching: 0,
  isLoading: true,
  isRefreshing: false,
  error: null,
  lastSuccessfulFetchMs: null,
};

export function useLiveFlights(region: FlightBounds, limit: number) {
  const [state, setState] = useState<LiveFlightsState>(initialState);

  useEffect(() => {
    let disposed = false;
    let timeoutId: number | null = null;
    let controller: AbortController | null = null;

    const poll = async (firstLoad = false) => {
      controller?.abort();
      controller = new AbortController();

      startTransition(() => {
        setState((current) => ({
          ...current,
          isLoading: firstLoad && current.flights.length === 0,
          isRefreshing: !firstLoad || current.flights.length > 0,
          error: firstLoad ? null : current.error,
        }));
      });

      try {
        const response = await fetchOpenSkyFlights({
          bounds: region,
          limit,
          signal: controller.signal,
        });

        if (disposed) {
          return;
        }

        startTransition(() => {
          setState({
            flights: response.flights,
            totalMatching: response.totalMatching,
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastSuccessfulFetchMs: response.fetchedAt,
          });
        });
      } catch (error) {
        if (disposed || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to reach OpenSky";
        startTransition(() => {
          setState((current) => ({
            ...current,
            isLoading: false,
            isRefreshing: false,
            error: message,
          }));
        });
      } finally {
        if (!disposed) {
          timeoutId = window.setTimeout(() => poll(false), POLL_INTERVAL_MS);
        }
      }
    };

    poll(true);

    return () => {
      disposed = true;
      controller?.abort();

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [region, limit]);

  return state;
}
