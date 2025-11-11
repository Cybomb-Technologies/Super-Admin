exports.superAdminDashboard = (req, res) => {
  res.json({
    msg: "Super Admin Panel",
    user: req.user,
  });
};

exports.adminDashboard = (req, res) => {
  res.json({
    msg: "Admin Panel Access",
    user: req.user,
  });
};
