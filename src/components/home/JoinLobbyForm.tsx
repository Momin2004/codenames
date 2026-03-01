import { Button, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Formik } from "formik";
import * as yup from "yup";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel";
import React from "react";

const schema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "At least 2 characters")
    .max(30, "Bro thats enough"),
});

interface JoinLobbyFormProps {
  setPlayerId: React.Dispatch<React.SetStateAction<Id<"player"> | undefined>>;
  lobbyId: Id<"lobby">
}

export const JoinLobbyForm = ({ setPlayerId, lobbyId }: JoinLobbyFormProps) => {
  const createPlayer = useMutation(api.GameFunctions.createPlayer);
  const joinLobby = useMutation(api.GameFunctions.joinLobby);

  return (
    <Formik
      initialValues={{ username: "" }}
      validationSchema={schema}
      onSubmit={async (values) => {
        const username = values.username.trim();
        const { playerId } = await createPlayer({ username });
        await joinLobby({ lobbyId, playerId });
        setPlayerId(playerId);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="center">
            <Stack spacing={1} sx={{ width: "100%", maxWidth: 420 }}>
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
            </Stack>

            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!dirty || !isValid}
              sx={{
                width: "100%",
                maxWidth: 420,
                py: 1.25,
                px: 2.5,
                borderRadius: 1.5,
                boxShadow: "0 8px 20px rgba(68,161,148,0.25)",
              }}
            >
              Join Lobby
            </Button>
          </Stack>
        </form>
      )}
    </Formik>
  );
};