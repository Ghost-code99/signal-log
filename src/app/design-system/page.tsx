import { NavigationHeader } from '@/components/navigation-header';
import { FormComponents } from '@/components/form-components';
import { ModalComponents } from '@/components/modal-components';
import { DataDisplayComponents } from '@/components/data-display-components';
import { MinimalistDemo } from '@/components/minimalist-demo';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="pt-16">
        <MinimalistDemo />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Design System Showcase</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Comprehensive examples of all components following our minimalist design system.
              Each component demonstrates consistent styling, accessibility, and user experience.
            </p>
          </div>
          
          <div className="space-y-16">
            <FormComponents />
            <ModalComponents />
            <DataDisplayComponents />
          </div>
        </div>
      </div>
    </div>
  );
}
