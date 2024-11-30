// /components/dashboard/template/index.tsx

'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout';
import { TemplateEditor } from './TemplateEditor';
import { TemplateList } from './TemplateList';
import { TemplateRenderer } from './TemplateRenderer';
import { Template } from '@/types/template/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  userDetails: { [x: string]: any } | null;
}

export default function TemplateManagement(props: Props) {
  // State for managing UI
  const [showEditor, setShowEditor] = useState(false);
  const [showRenderer, setShowRenderer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  // Handler for template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowRenderer(true);
  };

  // Handler for creating new template
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setMode('create');
    setShowEditor(true);
  };

  // Handler for editing template
  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setMode('edit');
    setShowEditor(true);
  };

  // Handler for delete confirmation
  const handleDeleteConfirm = (template: Template) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  // Handler for template save
  const handleSave = async (template: Template) => {
    setShowEditor(false);
    // Refresh template list or update local state
  };

  // Handler for template deletion
  const handleDelete = async () => {
    if (selectedTemplate?.id) {
      // Delete template logic here
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
      // Refresh template list
    }
  };

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
    >
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Templates</h1>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Template List */}
        <div className="mb-6">
          <TemplateList
            onSelect={handleTemplateSelect}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        </div>

        {/* Template Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? 'Create Template' : 'Edit Template'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Create a new template for your AI interactions'
                  : 'Modify your existing template'}
              </DialogDescription>
            </DialogHeader>
            <TemplateEditor
              initialTemplate={selectedTemplate}
              onSave={handleSave}
              onCancel={() => setShowEditor(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Template Renderer Dialog */}
        <Dialog open={showRenderer} onOpenChange={setShowRenderer}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <TemplateRenderer
                template={selectedTemplate}
                onComplete={() => setShowRenderer(false)}
                onError={(error) => {
                  console.error('Template execution error:', error);
                  // Handle error (e.g., show toast notification)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this template? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}