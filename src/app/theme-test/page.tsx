'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import ThemeToggleDropdown from '@/components/ThemeToggleDropdown';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  XCircle
} from 'lucide-react';

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dark Mode Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Testing dark mode implementation across all components
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <ThemeToggleDropdown />
            </div>
          </div>
        </div>

        {/* Theme Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Theme</Label>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {theme}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Resolved Theme</Label>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {resolvedTheme}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buttons Test */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements Test */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Test Input</Label>
                <Input id="test-input" placeholder="Enter some text..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-input-error">Error Input</Label>
                <Input id="test-input-error" error placeholder="This has an error" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-input-disabled">Disabled Input</Label>
                <Input id="test-input-disabled" disabled placeholder="This is disabled" />
              </div>
            </CardContent>
          </Card>

          {/* Badges Test */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status Icons Test */}
          <Card>
            <CardHeader>
              <CardTitle>Status Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600" />
                  <span className="text-sm">Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-error-600" />
                  <span className="text-sm">Error</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <h4 className="font-medium">Primary</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-primary-50 dark:bg-primary-900 rounded border"></div>
                  <div className="h-8 bg-primary-100 dark:bg-primary-800 rounded border"></div>
                  <div className="h-8 bg-primary-500 dark:bg-primary-500 rounded border"></div>
                  <div className="h-8 bg-primary-600 dark:bg-primary-400 rounded border"></div>
                  <div className="h-8 bg-primary-900 dark:bg-primary-100 rounded border"></div>
                </div>
              </div>

              {/* Gray Colors */}
              <div className="space-y-2">
                <h4 className="font-medium">Gray</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-gray-50 dark:bg-gray-900 rounded border"></div>
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded border"></div>
                  <div className="h-8 bg-gray-500 dark:bg-gray-500 rounded border"></div>
                  <div className="h-8 bg-gray-600 dark:bg-gray-400 rounded border"></div>
                  <div className="h-8 bg-gray-900 dark:bg-gray-100 rounded border"></div>
                </div>
              </div>

              {/* Success Colors */}
              <div className="space-y-2">
                <h4 className="font-medium">Success</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-success-50 dark:bg-success-900 rounded border"></div>
                  <div className="h-8 bg-success-500 dark:bg-success-500 rounded border"></div>
                  <div className="h-8 bg-success-600 dark:bg-success-400 rounded border"></div>
                  <div className="h-8 bg-success-700 dark:bg-success-300 rounded border"></div>
                </div>
              </div>

              {/* Warning Colors */}
              <div className="space-y-2">
                <h4 className="font-medium">Warning</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-warning-50 dark:bg-warning-900 rounded border"></div>
                  <div className="h-8 bg-warning-500 dark:bg-warning-500 rounded border"></div>
                  <div className="h-8 bg-warning-600 dark:bg-warning-400 rounded border"></div>
                  <div className="h-8 bg-warning-700 dark:bg-warning-300 rounded border"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text Colors Test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Text Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-gray-100">Primary text (gray-900/100)</p>
              <p className="text-gray-700 dark:text-gray-300">Secondary text (gray-700/300)</p>
              <p className="text-gray-600 dark:text-gray-400">Muted text (gray-600/400)</p>
              <p className="text-gray-500 dark:text-gray-500">Disabled text (gray-500)</p>
              <p className="text-primary-600 dark:text-primary-400">Primary accent (primary-600/400)</p>
              <p className="text-success-600 dark:text-success-400">Success text (success-600/400)</p>
              <p className="text-warning-600 dark:text-warning-400">Warning text (warning-600/400)</p>
              <p className="text-error-600 dark:text-error-400">Error text (error-600/400)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
