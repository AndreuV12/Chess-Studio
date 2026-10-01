import Modal from "@/ui/components/common/Modal";

type DeleteMoveModalProps = {
  isOpen: boolean;
  descendantCount: number;
  isDeleting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteMoveModal({ isOpen, descendantCount, isDeleting, errorMessage, onClose, onConfirm }: DeleteMoveModalProps) {
  return (
    <Modal isOpen={isOpen} title="Eliminar movimiento" onClose={onClose} size="sm">
      <div className="space-y-5 px-6 py-5">
        <p className="text-sm leading-6 text-zinc-600">
          ¿Eliminar movimiento?{" "}
          {descendantCount === 1 ? (
            "Se eliminará también el movimiento que está a continuación."
          ) : (
            <>
              Se eliminarán los <strong className="font-semibold text-zinc-900">{descendantCount}</strong> movimientos que están a continuación.
            </>
          )}
        </p>

        {errorMessage && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
