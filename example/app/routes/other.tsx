import { Link, ThemeProvider } from "@mui/material";
import { green } from "@mui/material/colors";
import { createTheme } from "react-router-mui-integration/mui";

const customTheme = createTheme({
  palette: {
    primary: {
      main: green[500],
    },
  },
});

export default function Other() {
  return (
    <ThemeProvider theme={customTheme}>
      <Link href="/">Home</Link>
    </ThemeProvider>
  );
}
