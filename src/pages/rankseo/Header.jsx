import styles from './header.module.css';

const Header = ({ onRefresh, error }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Monitor your platform's key metrics and performance</p>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            title="Refresh data"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Header;