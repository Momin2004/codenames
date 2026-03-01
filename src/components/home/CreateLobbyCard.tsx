import { Box, Button, minor, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Formik } from "formik";
import * as yup from "yup";
import { createSxStyles } from "@/utils/createSxStyles";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

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

    surface: {
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
      py: 1.25,
      px: 2.5,
      borderRadius: 1.5,
      boxShadow: "0 8px 20px rgba(68,161,148,0.25)",
    },

    actions: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      pt: 2
    },
  });

export const CreateLobbyCard = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const createLobby = useMutation(api.GameFunctions.createLobby);
  const createPlayer = useMutation(api.GameFunctions.createPlayer);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.surface}>
        <Formik
          initialValues={{ username: "" }}
          validationSchema={schema}
          onSubmit={async (values) => {
            const username = values.username.trim();

            const { playerId } = await createPlayer({ username });
            const result = await createLobby({ admin: playerId });

            navigate(`/lobby/${result.lobbyid}`, { state: { playerId } });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isValid,
            dirty,
          }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h4" fontWeight={700} sx={styles.title}>
                  Lumo Codenames
                </Typography>

                <Stack spacing={1} sx={styles.inputSection}>
                  <TextField
                    fullWidth
                    name="username"
                    label="Enter your nickname"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.username && errors.username)}
                    helperText={touched.username ? errors.username : " "}
                  />

                  <Box sx={styles.actions}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={styles.submitButton}
                      disabled={!dirty || !isValid}
                    >
                      Create Lobby
                    </Button>
                  </Box>

                </Stack>


              </Stack>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};