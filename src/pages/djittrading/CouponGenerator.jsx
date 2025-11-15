import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Badge, Card } from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

function CouponGenerator() {
  const [show, setShow] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
  });

  // Axios instance with base URL
  const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/coupons");
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/coupons/create", formData);
      if (data.success) {
        setCoupons([data.coupon, ...coupons]);
        setShow(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minPurchase: "",
          maxDiscount: "",
          validFrom: "",
          validUntil: "",
          usageLimit: "",
        });
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDiscountBadgeVariant = (type) => {
    return type === "percentage" ? "success" : "primary";
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now > validUntil) {
      return { label: "Expired", variant: "danger" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: "Used", variant: "warning" };
    }

    if (validFrom <= now && validUntil >= now) {
      return { label: "Active", variant: "success" };
    }

    return { label: "Inactive", variant: "secondary" };
  };

  const containerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    padding: "20px 0",
  };

  const headerStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const tableStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const buttonStyle = {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    border: "none",
    borderRadius: "25px",
    padding: "10px 25px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s ease",
  };

  const modalStyle = {
    backdropFilter: "blur(5px)",
  };

  const formControlStyle = {
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    padding: "12px 15px",
    transition: "all 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <div className="container py-4">
        <Card style={headerStyle}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2
                  style={{
                    color: "#2c3e50",
                    fontWeight: "700",
                    marginBottom: "5px",
                  }}
                >
                  Coupon Generator
                </h2>
                <p style={{ color: "#7f8c8d", margin: 0 }}>
                  Create and manage discount coupons for your customers
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShow(true)}
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 15px rgba(102, 126, 234, 0.3)";
                }}
              >
                + Generate Coupon
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Coupon Table */}
        <Card style={tableStyle}>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading coupons...</p>
              </div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead
                  style={{
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    color: "white",
                  }}
                >
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Purchase</th>
                    <th>Max Discount</th>
                    <th>Valid From</th>
                    <th>Valid Until</th>
                    <th>Usage Limit</th>
                    <th>Used</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length > 0 ? (
                    coupons.map((c) => {
                      const status = getCouponStatus(c);
                      return (
                        <tr
                          key={c._id}
                          style={{
                            background:
                              status.label === "Active"
                                ? "rgba(102, 126, 234, 0.05)"
                                : "rgba(255, 255, 255, 0.5)",
                            borderLeft:
                              status.label === "Active"
                                ? "4px solid #28a745"
                                : status.label === "Expired"
                                ? "4px solid #dc3545"
                                : "4px solid #ffc107",
                          }}
                        >
                          <td>
                            <strong
                              style={{
                                color: "#2c3e50",
                                fontFamily: "monospace",
                                fontSize: "14px",
                              }}
                            >
                              {c.code}
                            </strong>
                          </td>
                          <td>
                            <Badge bg={getDiscountBadgeVariant(c.discountType)}>
                              {c.discountType}
                            </Badge>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: "600",
                                color:
                                  c.discountType === "percentage"
                                    ? "#28a745"
                                    : "#007bff",
                              }}
                            >
                              {c.discountValue}
                              {c.discountType === "percentage" ? "%" : "$"}
                            </span>
                          </td>
                          <td>{c.minPurchase ? `$${c.minPurchase}` : "-"}</td>
                          <td>{c.maxDiscount ? `$${c.maxDiscount}` : "-"}</td>
                          <td>{new Date(c.validFrom).toLocaleDateString()}</td>
                          <td>{new Date(c.validUntil).toLocaleDateString()}</td>
                          <td>{c.usageLimit || "Unlimited"}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: "600",
                                color:
                                  c.usedCount > 0 ? "#28a745" : "#6c757d",
                              }}
                            >
                              {c.usedCount}
                            </span>
                          </td>
                          <td>
                            <Badge bg={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div
                          style={{
                            color: "#7f8c8d",
                            fontSize: "18px",
                            padding: "40px",
                          }}
                        >
                          <i
                            className="fas fa-ticket-alt mb-3"
                            style={{ fontSize: "48px", opacity: 0.5 }}
                          ></i>
                          <br />
                          No coupons found. Create your first coupon!
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal for Coupon Creation */}
        <Modal show={show} onHide={() => setShow(false)} centered style={modalStyle}>
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
            }}
          >
            <Modal.Title>
              <i className="fas fa-magic me-2"></i>
              Generate New Coupon
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "30px" }}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                  <i className="fas fa-code me-2"></i>
                  Coupon Code
                </Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="e.g., SUMMER25"
                  style={formControlStyle}
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-tag me-2"></i>
                      Discount Type
                    </Form.Label>
                    <Form.Select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      style={formControlStyle}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-percentage me-2"></i>
                      Discount Value
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      required
                      placeholder={
                        formData.discountType === "percentage"
                          ? "e.g., 25"
                          : "e.g., 50"
                      }
                      style={formControlStyle}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-shopping-cart me-2"></i>
                      Min Purchase ($)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleChange}
                      placeholder="Optional"
                      style={formControlStyle}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-chart-line me-2"></i>
                      Max Discount ($)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      placeholder="Optional"
                      style={formControlStyle}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-calendar-plus me-2"></i>
                      Valid From
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                      <i className="fas fa-calendar-minus me-2"></i>
                      Valid Until
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
                  <i className="fas fa-users me-2"></i>
                  Usage Limit
                </Form.Label>
                <Form.Control
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited usage"
                  style={formControlStyle}
                />
              </Form.Group>

              <div className="text-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShow(false)}
                  className="me-2"
                  style={{
                    borderRadius: "25px",
                    padding: "10px 25px",
                    border: "2px solid #6c757d",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt me-2"></i>
                      Generate Coupon
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default CouponGenerator;