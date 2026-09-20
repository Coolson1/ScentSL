"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string; slug: string };

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const activeCategory = params.get("category") ?? "";
  const activeGender = params.get("gender")?.toUpperCase() ?? "";
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");

  function setParam(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  }

  function applyPriceFilter(e: React.FormEvent) {
    e.preventDefault();
    setParam({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  }

  return (
    <aside className="space-y-10 text-sm">
      <div>
        <h3 className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-brand-gold">
          Gender
          <span className="inline-block h-px flex-1 bg-ink/15" />
        </h3>
        <ul className="space-y-1">
          <li>
            <FilterButton
              active={!activeGender}
              onClick={() => setParam({ gender: undefined })}
            >
              All genders
            </FilterButton>
          </li>
          <li>
            <FilterButton
              active={activeGender === "MEN"}
              onClick={() => setParam({ gender: "MEN" })}
            >
              Men
            </FilterButton>
          </li>
          <li>
            <FilterButton
              active={activeGender === "WOMEN"}
              onClick={() => setParam({ gender: "WOMEN" })}
            >
              Women
            </FilterButton>
          </li>
          <li>
            <FilterButton
              active={activeGender === "UNISEX"}
              onClick={() => setParam({ gender: "UNISEX" })}
            >
              Unisex
            </FilterButton>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-brand-gold">
          Category
          <span className="inline-block h-px flex-1 bg-ink/15" />
        </h3>
        <ul className="space-y-1">
          <li>
            <FilterButton
              active={!activeCategory}
              onClick={() => setParam({ category: undefined })}
            >
              All categories
            </FilterButton>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <FilterButton
                active={activeCategory === category.slug}
                onClick={() => setParam({ category: category.slug })}
              >
                {category.name}
              </FilterButton>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={applyPriceFilter} className="space-y-4">
        <h3 className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-brand-gold">
          Price · SLE
          <span className="inline-block h-px flex-1 bg-ink/15" />
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <UnderlineInput
            id="minPrice"
            label="Min"
            value={minPrice}
            onChange={setMinPrice}
            placeholder="0"
          />
          <UnderlineInput
            id="maxPrice"
            label="Max"
            value={maxPrice}
            onChange={setMaxPrice}
            placeholder="∞"
          />
        </div>
        <button
          type="submit"
          className="group inline-flex items-center gap-2 pb-1 text-[10px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold"
        >
          Apply
          <span className="inline-block h-px w-8 bg-ink/40 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-gold" />
        </button>
      </form>

      <button
        type="button"
        onClick={clearAll}
        className="text-[10px] uppercase tracking-[0.32em] text-ink/55 transition-colors hover:text-ink"
      >
        — Clear all filters
      </button>
    </aside>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-baseline gap-3 py-1.5 text-left font-display text-base transition-colors ${
        active ? "text-brand-gold" : "text-ink/75 hover:text-ink"
      }`}
    >
      <span
        className={`inline-block h-px transition-all duration-500 ${
          active ? "w-6 bg-brand-gold" : "w-2 bg-ink/30 group-hover:w-5"
        }`}
      />
      <span className={active ? "italic" : ""}>{children}</span>
    </button>
  );
}

function UnderlineInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
        {label}
      </span>
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-b border-ink/25 bg-transparent pb-1 font-display text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none"
      />
    </label>
  );
}
