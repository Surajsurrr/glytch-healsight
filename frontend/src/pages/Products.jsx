import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Pagination,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import api from '../utils/api';

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_asc', label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'popularity', label: 'Popularity' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disease, setDisease] = useState('');
  const [diseaseRecs, setDiseaseRecs] = useState([]);
  const [personalRecs, setPersonalRecs] = useState([]);
  const [openBuy, setOpenBuy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // UI state
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadPersonalRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // reload products when filters change
    setPage(1);
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const loadCategories = async () => {
    try {
      // fetch a larger set just to derive categories and brands
      const res = await api.get('/products', { params: { page: 1, limit: 200 } });
      const list = res.data.data || [];
      const cats = Array.from(new Set(list.map(p => p.category).filter(Boolean)));
      const bs = Array.from(new Set(list.map(p => p.brand).filter(Boolean)));
      setCategories(cats);
      setBrands(bs);
      // initialize price slider bounds
      const prices = list.map(p => Number(p.price) || 0);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceRange([min, max]);
      }
    } catch (err) {
      // ignore
    }
  };

  const loadProducts = async (forPage = page) => {
    setLoading(true);
    try {
      const params = { page: forPage, limit };
      if (activeCategory) params.category = activeCategory;
      const res = await api.get('/products', { params });
      const data = res.data.data || [];
      setProducts(data);
      if (res.data.pagination) setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalRecs = async () => {
    try {
      const res = await api.get('/products/recommend/personalized');
      setPersonalRecs(res.data.data || []);
    } catch (err) {
      // ignore auth errors silently
    }
  };

  const handleDiseaseRecommend = async () => {
    if (!disease.trim()) return setFeedback({ type: 'warning', message: 'Please enter a disease or symptoms' });
    setFeedback(null);
    try {
      const res = await api.post('/products/recommend/disease', { disease });
      setDiseaseRecs(res.data.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Recommendation failed' });
    }
  };

  const handleBuy = (product) => {
    setSelectedProduct(product);
    setOpenBuy(true);
  };

  const confirmBuy = async () => {
    setOpenBuy(false);
    setFeedback({ type: 'success', message: `Purchase request for "${selectedProduct?.name}" submitted (demo).` });
    setSelectedProduct(null);
  };

  // client-side filtering/sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];
    // brand filter
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand));
    // price filter
    list = list.filter(p => {
      const price = Number(p.price) || 0;
      return price >= (priceRange[0] || 0) && price <= (priceRange[1] || Infinity);
    });

    // sorting
    if (sortBy === 'price_asc') list.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
    else if (sortBy === 'price_desc') list.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    else if (sortBy === 'popularity') list.sort((a,b) => (b.soldCount||0) - (a.soldCount||0));

    return list;
  }, [products, selectedBrands, priceRange, sortBy]);

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'linear-gradient(90deg, rgba(13,110,253,0.06), rgba(13,110,253,0.02))' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">Medicines & Products</Typography>
        <Typography variant="body2" color="text.secondary">Browse available products and get AI recommendations.</Typography>
      </Box>

      {feedback && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField label="Enter disease or symptoms" value={disease} onChange={(e) => setDisease(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleDiseaseRecommend}>Get Recommendations</Button>
      </Box>

      {diseaseRecs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">AI Recommendations for "{disease}"</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
            {diseaseRecs.map(p => (
              <Card key={p._id} sx={{ minWidth: 220, flex: '0 0 auto', transition: 'transform .18s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
                {p.images?.[0]?.url && <CardMedia component="img" height="140" image={p.images[0].url} alt={p.name} />}
                <CardContent>
                  <Typography fontWeight="bold" noWrap>{p.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="text.secondary">₹{p.price}</Typography>
                    <Chip label={`₹${p.price}`} color="primary" size="small" />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="contained" onClick={() => handleBuy(p)} fullWidth>Buy</Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {personalRecs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Recommended for you</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {personalRecs.map(p => (
              <Grid item xs={12} sm={6} md={3} key={p._id}>
                <Card>
                  {p.images?.[0]?.url && <CardMedia component="img" height="140" image={p.images[0].url} alt={p.name} />}
                  <CardContent>
                    <Typography fontWeight="bold">{p.name}</Typography>
                    <Typography color="text.secondary">₹{p.price}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button size="small" variant="contained" onClick={() => handleBuy(p)}>Buy</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Category tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={activeCategory || 'all'} onChange={(e, val) => setActiveCategory(val === 'all' ? '' : val)} variant="scrollable" scrollButtons="auto">
          <Tab label="All" value="all" />
          {categories.map(c => <Tab key={c} label={c} value={c} />)}
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        {/* Left: facets */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, mb: 2, position: 'sticky', top: 96 }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>Filters</Typography>
            <Divider sx={{ mb: 1 }} />

            <Typography variant="subtitle2">Sort</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select labelId="sort-label" value={sortBy} label="Sort" onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(o => <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>

            <Typography variant="subtitle2">Price Range</Typography>
            <Slider value={priceRange} onChange={(e, newVal) => setPriceRange(newVal)} valueLabelDisplay="auto" min={0} max={5000} sx={{ mb: 2 }} />

            <Typography variant="subtitle2">Brands</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
              {brands.map(b => (
                <Chip key={b} label={b} color={selectedBrands.includes(b) ? 'primary' : 'default'} onClick={() => {
                  if (selectedBrands.includes(b)) setSelectedBrands(selectedBrands.filter(x => x !== b));
                  else setSelectedBrands([...selectedBrands, b]);
                }} />
              ))}
            </Stack>

            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">Tip: Use filters to refine your search quickly.</Typography>
          </Card>
        </Grid>

        {/* Right: products */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">All Products</Typography>
            <Pagination count={totalPages} page={page} onChange={(e, p) => { setPage(p); loadProducts(p); }} color="primary" />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map(p => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
                  <Card sx={{ transition: 'transform .18s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
                    <Box sx={{ position: 'relative' }}>
                      {p.images?.[0]?.url ? (
                        <CardMedia component="img" height="160" image={p.images[0].url} alt={p.name} />
                      ) : (
                        <Box sx={{ height: 160, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography color="text.secondary">No Image</Typography>
                        </Box>
                      )}
                      <Chip label={`₹${p.price}`} color="primary" size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'background.paper' }} />
                    </Box>
                    <CardContent>
                      <Typography fontWeight="bold" noWrap>{p.name}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: 12 }}>{p.category} {p.brand ? `• ${p.brand}` : ''}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>₹{p.price}</Typography>
                        <Button size="small" variant="contained" onClick={() => handleBuy(p)}>Buy</Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={totalPages} page={page} onChange={(e, p) => { setPage(p); loadProducts(p); }} color="primary" />
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openBuy} onClose={() => setOpenBuy(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography>{selectedProduct?.name}</Typography>
          <Typography color="text.secondary">Price: ₹{selectedProduct?.price}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBuy(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmBuy}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
