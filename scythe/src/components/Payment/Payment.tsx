import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  useTheme
} from "@mui/material";
import React, { useEffect } from "react";
import { GetGuilds } from "../../state/discord/actions";
import { useAdminGuilds, useUser } from "../../state/discord/hooks";
import { useAppDispatch } from "../../state/hooks";

const Payment: React.FC<{}> = () => {
  const theme = useTheme();
  const [amountError, setAmountError] = React.useState(false);
  const [form, setForm] = React.useState<any>();
  const [discord_id, setDiscord] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const guilds = useAdminGuilds();
  const user = useUser();

  useEffect(() => {
    dispatch(GetGuilds());
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.productAmount < 10) {
      setAmountError(true);
      return;
    } else {
      setAmountError(false);
    }

    const guild = guilds.filter(g => g.id === discord_id);

    fetch("/api/v1/create_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.productName,
        email: user.email,
        product_name: form.productName,
        description: form.productDescription,
        price: Number(form.productAmount),
        target_server: discord_id,
        discord_id: user.id,
        discord_name: guild[0].name,
        discord_icon: guild[0].icon,
      }),
    })
      .then((res) => {
        console.log(res.status);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.currentTarget;
    setForm({ ...form, [id]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setDiscord(event.target.value as string);
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <Container maxWidth="md">
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xl: 2 }}
            sx={{
              py: theme.spacing(2),
            }}
          >
            <Grid item xl={1}>
              <TextField
                required
                id="name"
                label="Name"
                fullWidth
                onChange={handleChange}
                autoComplete="name"
                variant="standard"
              />
            </Grid>
            <Grid item xl={1}>
              <TextField
                required
                id="email"
                label="Email"
                value={user.email}
                fullWidth
                disabled
                autoComplete="email"
                variant="standard"
              />
            </Grid>
            <Grid item xl={1}>
              <TextField
                required
                id="productName"
                onChange={handleChange}
                label="Product Name"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xl={1}>
              <TextField
                required
                onChange={handleChange}
                id="productDescription"
                label="Product Description"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xl={1}>
              <FormControl fullWidth variant="standard">
                <InputLabel htmlFor="productAmount">Product Amount</InputLabel>
                <Input
                  id="productAmount"
                  error={amountError}
                  required
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                />
                {amountError ? (
                  <FormHelperText error>
                    Amount must be greater than 10
                  </FormHelperText>
                ) : null}
              </FormControl>
            </Grid>
            <Grid item xl={1}>
              <FormControl fullWidth variant="standard">
                <InputLabel id="target_server">Discord Server</InputLabel>
                <Select
                  labelId="target_server"
                  id="target_server"
                  value={discord_id}
                  onChange={handleSelectChange}
                  required
                >
                  {guilds.map((guild) => (
                    <MenuItem key={guild.id} value={guild.id}>
                      {guild.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xl={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button type="submit">Create Product</Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </form>
    </React.Fragment>
  );
};

export default Payment;
