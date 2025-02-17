import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function SummaryCard({ title, content }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <pre>{content}</pre>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;