export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
