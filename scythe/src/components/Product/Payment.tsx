import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { GetGuilds } from "../../state/discord/actions";
import { useAdminGuilds, useUser } from "../../state/discord/hooks";
import { useAppDispatch } from "../../state/hooks";
import { CreateProduct, GetRole } from "../../state/payments/actions";
import { useProduct, useRoles } from "../../state/payments/hooks";
import { DashboardSubscription } from "../../state/payments/reducer";
import SubCard from "../Subscription/Card";

const Payment: React.FC<{}> = () => {
  const theme = useTheme();
  const [amountError, setAmountError] = React.useState(false);
  const [form, setForm] = React.useState<any>();
  const [discord_id, setDiscord] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const guilds = useAdminGuilds();
  const user = useUser();
  const roles = useRoles();
  const prod = useProduct();
  const [loading, setLoading] = React.useState(false);
  const [sub, setSub] = React.useState<DashboardSubscription>();
  const [roleId, setRole] = React.useState("");

  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(GetGuilds());
  }, []);

  useEffect(() => {
    if (!discord_id) return;
    dispatch(GetRole({ server_id: discord_id }));
  }, [discord_id]);

  useEffect(() => {
    if (!prod.loading) return;
    if (prod.loading === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [prod.loading]);

  useEffect(() => {
    if (!discord_id || !form) return;

    const guild = guilds.filter((g) => g.id === discord_id);
    const roleName = roles.roles.filter((r: any) => r.id === roleId).length > 0 ? roles.roles.filter((r: any) => r.id === roleId)[0].name : "";

    setSub({
      prod_id: "",
      sub_id: "",
      server_id: discord_id,
      cus_id: "",
      name: guild[0].name,
      icon: guild[0].icon || "",
      description: form.serverDescription,
      sub_name: form.productName,
      sub_price: form.productAmount,
      sub_description: form.productDescription,
      role_id: roleId,
      role_name: roleName,
    });
  }, [form, discord_id, roleId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.productAmount < 10) {
      setAmountError(true);
      return;
    } else {
      setAmountError(false);
    }

    const guild = guilds.filter((g) => g.id === discord_id);
    const roleName = roles.roles.filter((r: any) => r.id === roleId).length > 0 ? roles.roles.filter((r: any) => r.id === roleId)[0].name : "";

    dispatch(CreateProduct({
      name: form.productName,
      email: user.email,
      product_name: form.productName,
      description: form.productDescription,
      price: Number(form.productAmount),
      target_server: discord_id,
      discord_id: user.id,
      discord_name: guild[0].name,
      discord_icon: guild[0].icon || "",
      discord_description: form.serverDescription,
      role_id: roleId || undefined,
      role_name: roleName || undefined,
    }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.currentTarget;
    setForm({ ...form, [id]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setDiscord(event.target.value as string);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  }

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
            <Grid item xl={1}>
              <TextField
                required
                onChange={handleChange}
                id="serverDescription"
                label="Server Description"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xl={1}>
              <FormControl fullWidth variant="standard">
                <InputLabel id="roleId">Role</InputLabel>
                <Select
                  labelId="roleId"
                  id="roleId"
                  value={roleId}
                  onChange={handleRoleChange}
                  disabled={roles.roles.length === 0}
                >
                  <MenuItem value="">
                    None
                  </MenuItem>
                  {roles.roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
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
                <LoadingButton loading={loading} type="submit">
                  Create Product
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </form>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Did you invite the bot to the server?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you did not invite the bot to the server, you will not be able to
            have users join after subscribing or have users join with a specific
            role.
          </DialogContentText>
          <DialogContentText>
            Invite the bot by clicking on this{" "}
            <Link href="https://discord.com/api/oauth2/authorize?client_id=966453809335382106&permissions=8&response_type=code&scope=bot">
              link
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleClose} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {sub ? (
        <Container
          sx={{
            my: 3,
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            alignItems="center"
            justifyContent="center"
            sx={{
              maxWidth: "xl",
            }}
          >
            <SubCard sub={sub} />
          </Grid>
        </Container>
      ) : null}
    </React.Fragment>
  );
};

export default Payment;
