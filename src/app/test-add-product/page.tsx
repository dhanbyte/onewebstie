import AddProductForm from '@/components/AddProductForm';

export default function TestAddProductPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Test Add Product Form</h1>
        <AddProductForm />
      </div>
    </div>
  );
}