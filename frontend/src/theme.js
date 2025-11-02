// MUI v5
import { createTheme } from "@mui/material/styles";

export const DFS_BLUE = "#0B74E5"; // xanh DFS
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: DFS_BLUE, contrastText: "#fff" },
    background: { default: "#f6fbff", paper: "#fff" },
  },
  shape: { borderRadius: 12 },
});
export default theme;
