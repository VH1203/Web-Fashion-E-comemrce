import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { productService } from "../../services/productService";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/formatCurrency";

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm],
    queryFn: () => productService.searchProducts(debouncedSearchTerm),
    enabled: !!debouncedSearchTerm,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleResultClick = (slug) => {
    setSearchTerm("");
    setShowResults(false);
    navigate(`/product/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!debouncedSearchTerm) return;
    setShowResults(false);
    navigate(`/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearchSubmit}
      sx={{ position: "relative", flex: 1, maxWidth: { md: 720, sm: 520 } }}
    >
      <TextField
        name="q"
        size="small"
        fullWidth
        placeholder="Tìm kiếm sản phẩm…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "999px",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
          },
        }}
      />
      {showResults && debouncedSearchTerm && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {isError && (
            <Typography color="error" sx={{ p: 2 }}>
              Không thể tải kết quả.
            </Typography>
          )}
          {searchResults && searchResults.length > 0 && (
            <List dense>
              {searchResults.map((product) => (
                <ListItem key={product._id} disablePadding>
                  <ListItemButton
                    onClick={() => handleResultClick(product.slug)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={product.images?.[0]}
                        alt={product.name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={formatCurrency(product.base_price)}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {searchResults && searchResults.length === 0 && !isLoading && (
            <Typography sx={{ p: 2 }}>
              Không tìm thấy sản phẩm nào cho "{debouncedSearchTerm}".
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
