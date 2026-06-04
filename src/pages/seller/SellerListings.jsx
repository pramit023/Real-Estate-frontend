import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiArrowsExpand,
  HiChevronDown,
  HiEye,
  HiHome,
  HiLocationMarker,
  HiOfficeBuilding,
  HiPencil,
  HiPlus,
  HiShieldCheck,
  HiTrash,
  HiUserGroup,
} from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';

const MAX_PROPERTY_IMAGES = 10;

const emptyForm = {
  title: '',
  description: '',
  price: '',
  city: '',
  area: '',
  pincode: '',
  propertyType: 'flat',
  bhk: '',
  bathrooms: '',
  areaSize: '',
  furnishing: 'unfurnished',
  status: 'sale',
  amenities: '',
};

const statusLabels = {
  sale: 'Available',
  rent: 'Available',
  sold: 'Sold',
};

const SellerListings = () => {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const imagePreviews = useMemo(
    () => images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    })),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews]);

  const loadProperties = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_URL}/api/property/my`, { headers });
      setProperties(res.data.properties || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [headers, token]);

  useEffect(() => {
    queueMicrotask(loadProperties);
  }, [loadProperties]);

  const openCreateModal = () => {
    setEditingProperty(null);
    setFormData(emptyForm);
    setImages([]);
    setImageError('');
    setModalOpen(true);
  };

  const openEditModal = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      city: property.city || '',
      area: property.area || '',
      pincode: property.pincode || '',
      propertyType: property.propertyType || 'flat',
      bhk: property.bhk || '',
      bathrooms: property.bathrooms || '',
      areaSize: property.areaSize || '',
      furnishing: property.furnishing || 'unfurnished',
      status: property.status || 'sale',
      amenities: property.amenities?.join(', ') || '',
    });
    setImages([]);
    setImageError('');
    setModalOpen(true);
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const existingImageCount = editingProperty?.images?.length || 0;
  const availableImageSlots = Math.max(MAX_PROPERTY_IMAGES - existingImageCount, 0);

  const handleImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > availableImageSlots) {
      setImageError(`You can add ${availableImageSlots} more image${availableImageSlots === 1 ? '' : 's'} to this property.`);
      setImages(selectedFiles.slice(0, availableImageSlots));
      event.target.value = '';
      return;
    }

    setImageError('');
    setImages(selectedFiles);
  };

  const buildPayload = () => {
    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    payload.set('amenities', JSON.stringify(
      formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    ));

    images.forEach((file) => payload.append('images', file));
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (images.length > availableImageSlots) {
      setError(`You can upload a maximum of ${MAX_PROPERTY_IMAGES} images per property.`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = buildPayload();
      const config = {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingProperty) {
        const res = await axios.put(`${API_URL}/api/property/${editingProperty._id}`, payload, config);
        setProperties((prev) => prev.map((item) => (item._id === editingProperty._id ? res.data.property : item)));
      } else {
        const res = await axios.post(`${API_URL}/api/property/my`, payload, config);
        setProperties((prev) => [res.data.property, ...prev]);
      }

      setModalOpen(false);
      setEditingProperty(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save property.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await axios.delete(`${API_URL}/api/property/${propertyId}`, { headers });
      setProperties((prev) => prev.filter((property) => property._id !== propertyId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete property.');
    }
  };

  const handleStatusChange = async (propertyId, status) => {
    try {
      const res = await axios.patch(`${API_URL}/api/property/${propertyId}/status`, { status }, { headers });
      setProperties((prev) => prev.map((property) => (property._id === propertyId ? res.data.property : property)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update property status.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusLabel = (status) => statusLabels[status] || 'Available';

  return (
    <div className="min-h-full bg-white px-2 py-2 md:px-0">
      <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <h1 className="mb-2 text-[1.875rem] font-extrabold leading-tight text-[#111827]">
            My Listings
          </h1>
          <p className="text-[0.95rem] text-[#111827]">
            Manage your listed properties and their status.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-12 items-center justify-center rounded-[10px] bg-primary px-7 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.18)] hover:bg-primary-dark"
        >
          Add New Listing
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="loader" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[#6b7280]">
          No listings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 2xl:grid-cols-3">
          {properties.map((property) => {
            const isSold = property.status === 'sold';
            const statusLabel = getStatusLabel(property.status);

            return (
              <article
                key={property._id}
                className="w-full max-w-[374px] overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="relative h-[220px] overflow-hidden bg-[#08745f]">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#159a80_0%,#07664f_58%,#043a32_100%)]">
                      <HiHome className="h-36 w-36 text-white drop-shadow-[0_16px_18px_rgba(0,0,0,0.35)]" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-[0.72rem] font-extrabold uppercase text-white ${isSold ? 'bg-[#64748b]' : 'bg-[#10b981]'}`}>
                      {statusLabel}
                    </span>
                    {property.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[0.72rem] font-extrabold uppercase text-white">
                        <HiShieldCheck />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-12">
                    <p className="text-[1.55rem] font-extrabold leading-none text-white">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold uppercase text-primary">{property.propertyType}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#111827]">
                      <HiEye />
                      {property.views || 0}
                    </span>
                  </div>

                  <h2 className="mb-3 truncate text-[1.12rem] font-extrabold text-[#111827]">
                    {property.title}
                  </h2>

                  <p className="mb-5 flex items-center gap-2 text-sm text-[#4b5563]">
                    <HiLocationMarker className="shrink-0 text-[#9ca3af]" />
                    <span className="truncate">{property.area}, {property.city}</span>
                  </p>

                  <div className="mb-9 grid grid-cols-3 border-t border-[#f1f5f9] pt-4 text-center">
                    <div>
                      <HiHome className="mx-auto mb-2 text-xl text-[#64748b]" />
                      <p className="font-extrabold text-[#111827]">{property.bhk || 0}</p>
                      <p className="text-[0.65rem] font-extrabold uppercase text-[#9ca3af]">Beds</p>
                    </div>
                    <div className="border-x border-[#f1f5f9]">
                      <HiUserGroup className="mx-auto mb-2 text-xl text-[#64748b]" />
                      <p className="font-extrabold text-[#111827]">{property.bathrooms || Math.max(1, (parseInt(property.bhk, 10) || 1) - 1)}</p>
                      <p className="text-[0.65rem] font-extrabold uppercase text-[#9ca3af]">Baths</p>
                    </div>
                    <div>
                      <HiArrowsExpand className="mx-auto mb-2 text-xl text-[#64748b]" />
                      <p className="font-extrabold text-[#111827]">{property.areaSize || 0}</p>
                      <p className="text-[0.65rem] font-extrabold uppercase text-[#9ca3af]">Sq Ft</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                    <label className="relative block">
                      <select
                        value={property.status || 'sale'}
                        onChange={(event) => handleStatusChange(property._id, event.target.value)}
                        className="h-11 w-full appearance-none rounded-[8px] border border-[#e5e7eb] bg-white px-3 pr-9 text-sm font-extrabold text-primary outline-none focus:border-primary"
                      >
                        <option value="sale">Available</option>
                        <option value="rent">For Rent</option>
                        <option value="sold">Sold</option>
                      </select>
                      <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                    </label>

                    <button
                      type="button"
                      onClick={() => openEditModal(property)}
                      className="inline-flex items-center gap-2 rounded-[8px] px-2 py-2 text-sm font-bold text-[#111827] hover:bg-[#f8fafc]"
                    >
                      <HiPencil />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(property._id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#fff5f5] text-[#dc2626] hover:bg-[#fee2e2]"
                      title="Delete listing"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[12px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-main">{editingProperty ? 'Edit Property' : 'Add Property'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-[8px] px-3 py-2 text-text-muted hover:bg-[#f8fafc]">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Title</span>
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Description</span>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Price</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">City</span>
                <input name="city" value={formData.city} onChange={handleChange} required className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Area</span>
                <input name="area" value={formData.area} onChange={handleChange} required className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Pincode</span>
                <input name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Property Type</span>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary">
                  {['flat', 'apartment', 'villa', 'house', 'studio', 'penthouse', 'office', 'townhouse', 'plot', 'commercial'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Status</span>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary">
                  <option value="sale">Available</option>
                  <option value="rent">For Rent</option>
                  <option value="sold">Sold</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">BHK</span>
                <input name="bhk" value={formData.bhk} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Bathrooms</span>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Area Size</span>
                <input type="number" name="areaSize" value={formData.areaSize} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Furnishing</span>
                <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary">
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Amenities</span>
                <input name="amenities" value={formData.amenities} onChange={handleChange} placeholder="Parking, Gym, Lift" className="w-full rounded-[8px] border border-[#e2e8f0] p-3 outline-none focus:border-primary" />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  disabled={availableImageSlots === 0}
                  className="w-full rounded-[8px] border border-[#e2e8f0] p-3 disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                />
                <p className="mt-2 text-xs font-semibold text-[#64748b]">
                  {editingProperty
                    ? `${existingImageCount} existing image${existingImageCount === 1 ? '' : 's'}. You can add ${availableImageSlots} more.`
                    : `Select up to ${MAX_PROPERTY_IMAGES} property images.`}
                </p>
                {imageError && <p className="mt-2 text-sm font-semibold text-[#dc2626]">{imageError}</p>}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {imagePreviews.map((item) => (
                      <div key={`${item.file.name}-${item.file.lastModified}`} className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-2">
                        <img
                          src={item.url}
                          alt={item.file.name}
                          className="h-20 w-full rounded-md object-cover"
                        />
                        <p className="mt-1 truncate text-[0.7rem] text-[#64748b]">{item.file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Property'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerListings;
