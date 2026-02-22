import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Formik } from "formik";
import * as yup from "yup";
import { createSxStyles } from "@/utils/createSxStyles";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api"
import { useNavigate, useParams } from "react-router-dom";
import { Id } from "../../../convex/_generated/dataModel";

const schema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "At least 2 characters")
    .max(30, "Bro thats enough"),
});

const useStyles = () =>
  createSxStyles({
    root: {
      width: "min(750px, 100%)",
    },
    card: {
      width: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "primary.main",
      bgcolor: "rgba(30, 30, 30, 0.88)",
      backdropFilter: "blur(10px)",
      backgroundImage:
        "linear-gradient(180deg, rgba(68,161,148,0.08) 0%, rgba(83,125,150,0.04) 100%)",
      boxShadow:
        "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(68,161,148,0.08)",
    },
    cardContent: {
      p: { xs: 2.5, sm: 4 },
    },
    title: {
      color: "primary.main",
      letterSpacing: 0.4,
      textAlign: "center",
    },
    inputSection: {
      width: "100%",
      maxWidth: 420,

      "& .MuiInputLabel-root": {
        color: "text.secondary",
      },

      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.02)",

        "& fieldset": {
          borderColor: "rgba(68,161,148,0.30)",
        },
        "&:hover fieldset": {
          borderColor: "primary.main",
        },
        "&.Mui-focused fieldset": {
          borderColor: "primary.main",
        },
      },
    },
    submitButton: {
      width: '100%',
      py: 1.25,
      px: 2.5,
      borderRadius: 1.5,
      boxShadow: "0 8px 20px rgba(68,161,148,0.25)",
    },
  });

export const LobbyDisplay = () => {
  const styles = useStyles();
  const { lobbyId } = useParams();
  if (!lobbyId) return <div>Missing lobby id</div>;
  var lobby;
  try {
    lobby = useQuery(
      api.GameFunctions.getLobbyById,
      lobbyId ? { lobbyId: lobbyId as Id<"lobby"> } : "skip"
    );
  }
  catch (e) {
    return (
      <>
        <Typography variant="h5" fontWeight={700} sx={styles.title}>Lobby not found </Typography>
        <Typography color="secondary">
          This lobby may have been deleted or the link is invalid.
        </Typography>
      </>
    )
  }
  if (lobby === undefined) return <Typography variant="h5" fontWeight={700} sx={styles.title}>Loading...</Typography>

  return (
    <Box sx={styles.root}>
      <Card elevation={0} sx={styles.card}>
        <CardContent sx={styles.cardContent}>

        </CardContent>
      </Card>
    </Box>
  );
};