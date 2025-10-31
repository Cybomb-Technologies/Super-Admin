import React, { useEffect, useState } from "react";
import styles from './form-submission.module.css';

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE;

function Formsubmission() {
  const [activeTab, setActiveTab] = useState("all");
  const [bannerData, setBannerData] = useState([]);
  const [popupData, setPopupData] = useState([]);
  const [homeContactData, setHomeContactData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerRes = await fetch(`${API_URL}/api/banner-mail`);
        const popupRes = await fetch(`${API_URL}/api/popup-mail`);
        const homeRes = await fetch(`${API_URL}/api/send-mail`);

        const bannerJson = await bannerRes.json();
        const popupJson = await popupRes.json();
        const homeJson = await homeRes.json();

        setBannerData(bannerJson);
        setPopupData(popupJson);
        setHomeContactData(homeJson);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterData = (data, fields) =>
    data.filter((item) =>
      fields.some((field) =>
        item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const renderBannerTable = (data) =>
    filterData(data, ["fullName", "email", "phone", "company", "requirement"]).map((item) => (
      <tr key={item._id} className={styles.tableRow}>
        <td>{item.fullName}</td>
        <td>{item.email}</td>
        <td>{item.phone}</td>
        <td>{item.company}</td>
        <td>{item.requirement}</td>
        <td>{new Date(item.createdAt).toLocaleString()}</td>
      </tr>
    ));

  const renderPopupTable = (data) =>
    filterData(data, ["name", "email", "phone", "message"]).map((item) => (
      <tr key={item._id} className={styles.tableRow}>
        <td>{item.name}</td>
        <td>{item.email}</td>
        <td>{item.phone}</td>
        <td className={styles.messageCell}>{item.message}</td>
        <td>
          <span className={item.subscribe ? styles.subscribeYes : styles.subscribeNo}>
            {item.subscribe ? "Yes" : "No"}
          </span>
        </td>
        <td>{new Date(item.createdAt).toLocaleString()}</td>
      </tr>
    ));

  const renderHomeTable = (data) =>
    filterData(data, ["firstName", "email", "phone", "message"]).map((item) => (
      <tr key={item._id} className={styles.tableRow}>
        <td>{item.firstName}</td>
        <td>{item.email}</td>
        <td>{item.phone}</td>
        <td className={styles.messageCell}>{item.message}</td>
        <td>{new Date(item.createdAt).toLocaleString()}</td>
      </tr>
    ));

  const getTotalCount = () => {
    return bannerData.length + popupData.length + homeContactData.length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Form Submissions</h1> */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{getTotalCount()}</span>
            <span className={styles.statLabel}>Total Submissions</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bannerData.length}</span>
            <span className={styles.statLabel}>Banner Forms</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{popupData.length}</span>
            <span className={styles.statLabel}>Popup Forms</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{homeContactData.length}</span>
            <span className={styles.statLabel}>Home Forms</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Submissions
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "banner" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("banner")}
          >
            Banner Form
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "popup" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("popup")}
          >
            Popup Form
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "home" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home Contact
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading form submissions...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {activeTab === "banner" &&
                  ["Full Name", "Email", "Phone", "Company", "Requirement", "Date"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                {activeTab === "popup" &&
                  ["Name", "Email", "Phone", "Message", "Subscribe", "Date"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                {activeTab === "home" &&
                  ["First Name", "Email", "Phone", "Message", "Date"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                {activeTab === "all" && <th>Data Preview</th>}
              </tr>
            </thead>
            <tbody>
              {activeTab === "banner" && renderBannerTable(bannerData)}
              {activeTab === "popup" && renderPopupTable(popupData)}
              {activeTab === "home" && renderHomeTable(homeContactData)}
              {activeTab === "all" && (
                <>
                  {bannerData.length > 0 && (
                    <>
                      <tr className={styles.sectionHeader}>
                        <td colSpan="10">
                          <div className={styles.sectionTitle}>
                            <span>Banner Form Submissions</span>
                            <span className={styles.countBadge}>{bannerData.length}</span>
                          </div>
                        </td>
                      </tr>
                      {renderBannerTable(bannerData)}
                    </>
                  )}
                  {popupData.length > 0 && (
                    <>
                      <tr className={styles.sectionHeader}>
                        <td colSpan="10">
                          <div className={styles.sectionTitle}>
                            <span>Popup Form Submissions</span>
                            <span className={styles.countBadge}>{popupData.length}</span>
                          </div>
                        </td>
                      </tr>
                      {renderPopupTable(popupData)}
                    </>
                  )}
                  {homeContactData.length > 0 && (
                    <>
                      <tr className={styles.sectionHeader}>
                        <td colSpan="10">
                          <div className={styles.sectionTitle}>
                            <span>Home Contact Submissions</span>
                            <span className={styles.countBadge}>{homeContactData.length}</span>
                          </div>
                        </td>
                      </tr>
                      {renderHomeTable(homeContactData)}
                    </>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading &&
        bannerData.length === 0 &&
        popupData.length === 0 &&
        homeContactData.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No form submissions yet</h3>
            <p>Form submissions will appear here once users start submitting forms.</p>
          </div>
        )}
    </div>
  );
}

export default Formsubmission;