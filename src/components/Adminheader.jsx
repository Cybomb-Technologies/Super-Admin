function Adminheader(){
    return(
        <header className="admin-header">
            <div className="header-content">
                <div className="header-left">
                    {/* <div className="breadcrumb">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-divider">/</span>
                        <span className="breadcrumb-item-active">Overview</span>
                    </div> */}
                    <h1 className="page-title">Dashboard Overview</h1>
                </div>
                
                <div className="header-right">
                    <div className="header-actions">
                        <button className="notification-btn">
                            <i className="fas fa-bell"></i>
                            <span className="notification-badge">3</span>
                        </button>
                        
                        <div className="user-menu">
                            <div className="user-avatar">
                                {/* <img src="/api/placeholder/32/32" alt="Admin" /> */}S
                            </div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        </div>
                        
                        <button className="logout-btn">
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Adminheader;