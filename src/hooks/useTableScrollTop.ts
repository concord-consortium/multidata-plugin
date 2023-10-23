import { createContext, useContext, useEffect, useState } from "react";

export type TableScrollTopContextType = {
  scrollY: number
  tableScrollTop: number
};

const defaultValue: TableScrollTopContextType = {
  scrollY: 0,
  tableScrollTop: 0,
};

export const TableScrollTopContext = createContext<TableScrollTopContextType>(defaultValue);

export const useTableScrollTop = (tableRef: React.MutableRefObject<HTMLTableElement | null>) => {
  const [tableScrollTop, setTableScrollTop] = useState<TableScrollTopContextType>(defaultValue);

  useEffect(() => {
    const onScroll = (e: any) => {
      const tableTop = tableRef.current?.getBoundingClientRect().top ?? 0;
      setTableScrollTop({
        scrollY: window.scrollY,
        tableScrollTop: Math.max(0, tableTop),
      });
    };
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [tableRef]);

  return tableScrollTop;
};

export const useTableTopScrollTopContext = () => useContext(TableScrollTopContext);
