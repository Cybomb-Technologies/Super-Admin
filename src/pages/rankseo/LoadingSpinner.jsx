import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner() {
  return (
    <div className={`${styles.loadingContainer} d-flex align-items-center justify-content-center bg-dark`}>
      <div className="text-center">
        <div className={`${styles.spinner} spinner-border text-primary mb-3`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-light mb-0">Loading dashboard...</p>
      </div>
    </div>
  );
}