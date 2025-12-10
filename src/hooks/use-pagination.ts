"use client";
import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(
  items: T[], 
  itemsPerPage: number,
  dependencies: any[] = []
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => Math.min(startIndex + itemsPerPage, items.length), [startIndex, itemsPerPage, items.length]);

  return {
    paginatedItems,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    startIndex: startIndex,
    endIndex: endIndex,
    totalItems: items.length
  };
}
