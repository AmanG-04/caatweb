// /* Brand lists are editable — the client can add/remove names here. */

// const rows: { label: string; brands: string[] }[] = [
//   {
//     label: "Panels",
//     brands: ["Waaree", "Adani Solar", "Vikram Solar", "RenewSys"],
//   },
//   {
//     label: "Inverters & More",
//     brands: ["Growatt", "Sungrow", "Havells", "Luminous", "Racold (heaters)"],
//   },
// ];

// export default function EquipmentBrands() {
//   return (
//     <section className="bg-paper py-12">
//       <div className="mx-auto max-w-none 2xl:px-16 px-5 sm:px-8 text-center">
//         <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-violet">
//           We Install &amp; Service
//         </p>

//         <div className="mt-7 space-y-5">
//           {rows.map((row) => (
//             <div
//               key={row.label}
//               className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5"
//             >
//               <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft/70">
//                 {row.label}
//               </span>
//               {row.brands.map((brand) => (
//                 <span
//                   key={brand}
//                   className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink-soft transition-colors duration-200 hover:border-gold hover:text-ink"
//                 >
//                   {brand}
//                 </span>
//               ))}
//             </div>
//           ))}
//         </div>

//         <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-ink-soft">
//           We are brand-agnostic — sizing and quotes compare 2–3 options so you
//           pick on data, not on a salesman&rsquo;s margin.
//         </p>
//       </div>
//     </section>
//   );
// }


