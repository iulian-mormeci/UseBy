import { CategoryForm } from "@/components/forms/CategoryForm";

export default function NuovaCategoriaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Aggiungi categoria</h1>
      <CategoryForm />
    </div>
  );
}
