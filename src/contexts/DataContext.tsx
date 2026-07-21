import React, { createContext } from "react";
import { useParams } from "react-router";

const DataContext = createContext(null);

interface DataContextProps {
	children: React.ReactNode,

}

export default function DataProvider ({ children }) {
      const { id } = useParams();
      const [params] = useSearchParams();

	return (
		<DataContext.Provider>
			{children}
		</DataContext.Provider>
	)
}

export function useDataContext() {
	
}