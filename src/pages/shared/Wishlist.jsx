import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { HiHeart, HiTrash } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import API_URL from '../../../config';
import Navbar from '../../components/common/Navbar';
import PropertyCard from '../../components/common/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { wishlistStyles as s } from '../../assets/dummystyles';

const Wishlist = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist((res.data || []).filter((item) => item.property));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your wishlist.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(fetchWishlist);
  }, [fetchWishlist]);

  const handleRemove = async (propertyId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist((prev) => prev.filter((item) => String(item.property._id) !== String(propertyId)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove property from wishlist.');
    }
  };

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        <header className={s.headingWrapper}>
          <h1 className={s.heading}>Your Wishlist</h1>
          <p className={s.subheading}>Properties you've saved for later.</p>
        </header>

        {loading ? (
          <div className={s.emptyCard}>
            <div className={s.loader} />
          </div>
        ) : error ? (
          <div className={s.emptyCard}>
            <p className="text-red-600">{error}</p>
          </div>
        ) : wishlist.length === 0 ? (
          <section className={s.emptyCard}>
            <HiHeart size={40} className="mx-auto mb-8 text-text-main" />
            <h2 className={s.emptyTitle}>Your Wishlist is empty</h2>
            <p className={s.emptyText}>Start exploring properties and save your favorites!</p>
            <Link to="/properties" className={s.browseButton}>
              Browse Properties
            </Link>
          </section>
        ) : (
          <section className={s.gridContainer}>
            {wishlist.map((item) => (
              <PropertyCard
                key={item._id}
                property={item.property}
                isWishlisted
                onToggleWishlist={handleRemove}
                renderActions={(property) => (
                  <button
                    type="button"
                    className={s.removeButton}
                    onClick={() => handleRemove(property._id)}
                  >
                    <HiTrash />
                    Remove
                  </button>
                )}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
