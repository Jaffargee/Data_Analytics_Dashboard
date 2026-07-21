import React from "react"
import SearchInput from "../SearchInput";
import Button from "../Button";
import Select from "../Select";
import type { Option } from '../../../types/ui/index';

interface TableSearchProps {
	withButton?: boolean;
	withFilter?: boolean;
	filterValue?: string;
	filterOption?: Option[];
	buttonIcon?: any;
	title?: string;
	search: string;
	setSearch: (v: string) => void;
	setFilter?: (v: string) => void;
	onClick?: () => void;
}

export default function TableSearch ({ search, title, filterValue, withButton, withFilter, filterOption, buttonIcon: Icon, setFilter, setSearch, onClick }: TableSearchProps) {

	return (
		<div className="flex sticky w-full relative top-14 left-0 z-[1000] bg-[#0a0a0b] backdrop-blur-md shadow-md border-bg-border border-b">
			<div className="flex flex-row items-center justify-end flex-1 w-full gap-2 py-2 px-6">
				<SearchInput
					placeholder="Search customers…"
					value={search}
					onChange={(v: string) => setSearch(v)}
				/>
				{
					withButton && Icon &&
					<Button radius="full" variant="accent" icon={<Icon size={24} />} className="flex-shrink-0">
						<span>{title}</span>
					</Button>
				}
				{
					withFilter && 
					<Select value={filterValue} options={[{ value: 'ALL', label: 'ALL' }, ...filterOption]} onChange={(v) => setFilter(v)} className="max-w-[200px]" />
				}
			</div>
		</div>
	)
}