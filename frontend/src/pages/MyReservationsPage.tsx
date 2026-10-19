import { useReservations } from '@/hooks/useReservations';
import { Skeleton } from '@/components/ui/skeleton';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { ReservationEmptyState } from '@/components/reservations/ReservationEmptyState';
import { AlertMessage } from '@/components/ui/AlertMessage';

export function MyReservationsPage() {
  const { reservations, isLoading, errorMessage, handleCancelReservation } =
    useReservations();

  return (
    <div className="mx-auto w-full max-w-4xl py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-text font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          My Reservations
        </h1>
        <p className="text-muted font-sans text-sm">
          Track your position in waiting queues and manage books held for
          pickup.
        </p>
      </div>

      {errorMessage && (
        <AlertMessage message={errorMessage} className="mb-6 p-4" />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-border flex items-center gap-4 rounded-2xl border p-5"
            >
              <Skeleton className="bg-surface-2 h-24 w-16 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="bg-surface-2 h-5 w-1/2" />
                <Skeleton className="bg-surface-2 h-4 w-1/4" />
                <Skeleton className="bg-surface-2 mt-2 h-6 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <ReservationEmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((res) => (
            <ReservationCard
              key={res.id}
              reservation={res}
              onCancel={handleCancelReservation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
