import React, { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Paper } from "@mui/material";
import PendingReviewsTab from "./PendingReviewsTab";
import MyReviewsTab from "./MyReviewsTab";
import RateReviewIcon from "@mui/icons-material/RateReview";

// Helper component cho TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReviewsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <RateReviewIcon
          fontSize="large"
          sx={{ mr: 1, verticalAlign: "middle" }}
        />
        Đánh giá sản phẩm
      </Typography>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleChange}
            aria-label="review tabs"
            variant="fullWidth"
          >
            <Tab label="Chờ đánh giá" id="review-tab-0" />
            <Tab label="Đã đánh giá" id="review-tab-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          <PendingReviewsTab />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <MyReviewsTab />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ReviewsPage;
