import * as React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar.jsx';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../services/apiService.js";
import './Dashboard.css';

const steps = ['Payer Details', 'Payment Amount', 'Payment Status'];

export default function PaymentDashboard() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [payments, setPayments] = React.useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState("");
  const [formData, setFormData] = React.useState({
    payerName: "",
    amount: "",
    method: "",
    status: "pending",
  });

  const fetchPayments = async () => {
    const res = await getAllPayments();
    setPayments(res.data);
  };

  React.useEffect(() => {
    fetchPayments();
  }, []);

  const isStepOptional = (step) => step === 1;
  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = async () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    if (activeStep === steps.length - 1) {
      try {
        if (selectedPaymentId) {
          await updatePayment(selectedPaymentId, formData);
          alert("Payment updated!");
        } else {
          await createPayment(formData);
          alert("Payment created!");
        }
        fetchPayments();
        handleReset();
      } catch (error) {
        console.error(error);
        alert("Error saving payment.");
      }
    } else {
      setActiveStep((prev) => prev + 1);
      setSkipped(newSkipped);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) throw new Error("You can't skip a non-optional step.");
    setActiveStep((prev) => prev + 1);
    setSkipped((prev) => new Set(prev).add(activeStep));
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({ payerName: "", amount: "", method: "", status: "pending" });
    setSelectedPaymentId("");
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id);
      fetchPayments();
    }
  };

  const handleSelectPayment = async (e) => {
    const _id = e.target.value;
    setSelectedPaymentId(_id);
    if (_id) {
      const res = await getPaymentById(_id);
      setFormData(res.data);
      setActiveStep(0);
    } else {
      setFormData({ payerName: "", amount: "", method: "", status: "pending" });
      setActiveStep(0);
    }
  };

  return (
    <div>
    <ResponsiveAppBar sx={{ position: "fixed", width: "100%"}} />
    
    <div className="dashboard-container">
      <Typography variant="h3" gutterBottom align="center" color="primary">
        💰 Payment Dashboard 💰
      </Typography>

      <Grid container spacing={4} className="dashboard-grid">
        <Grid item xs={12} md={6}>
          <Paper className="dashboard-card" elevation={3}>
            <Typography variant="h5" gutterBottom>
              All Payments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payer Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No payments available.</TableCell>
                    </TableRow>
                  )}
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>{payment.payerName}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>
                        <Button color="error" variant="outlined" size="small" onClick={() => handleDelete(payment._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="dashboard-card" elevation={3}>
            <Typography variant="h5" gutterBottom>
              📝 Work with a Payment
            </Typography>
            <TextField
              select
              fullWidth
              value={selectedPaymentId}
              onChange={handleSelectPayment}
              label="Select a Payment"
              margin="normal"
            >
              <MenuItem value="">--Select Payment--</MenuItem>
              {payments.map((payment) => (
                <MenuItem key={payment._id} value={payment._id}>
                  {payment.payerName} - {payment.amount}
                </MenuItem>
              ))}
            </TextField>

            <Stepper activeStep={activeStep} className="dashboard-stepper">
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                if (isStepOptional(index)) labelProps.optional = <Typography variant="caption">Optional</Typography>;
                if (isStepSkipped(index)) stepProps.completed = false;
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <div className="dashboard-form-field">
              {activeStep === 0 && (
                <TextField fullWidth name="payerName" label="Payer Name" value={formData.payerName} onChange={handleInputChange} margin="normal" />
              )}
              {activeStep === 1 && (
                <TextField fullWidth type="number" name="amount" label="Amount" value={formData.amount} onChange={handleInputChange} margin="normal" />
              )}
              {activeStep === 2 && (
                <>
                  <TextField fullWidth name="method" label="Payment Method" value={formData.method} onChange={handleInputChange} margin="normal" />
                  <TextField
                    fullWidth
                    select
                    name="status"
                    label="Status"
                    value={formData.status}
                    onChange={handleInputChange}
                    margin="normal"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </TextField>
                </>
              )}
            </div>

            <div className="dashboard-stepper-buttons">
              <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>Back</Button>
              <div className="spacer" />
              {isStepOptional(activeStep) && <Button color="inherit" onClick={handleSkip}>Skip</Button>}
              <Button variant="contained" onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
    </div>
  );
}
