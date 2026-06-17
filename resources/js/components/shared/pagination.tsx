import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
}

export function Pagination({ links }: PaginationProps) {
  if (links.length <= 3) return null;

  return (
    <div className="flex flex-1 flex-wrap justify-end gap-1">
      {links.map((link, key) => {
        let label = link.label;
        let icon = null;

        if (link.label.includes('&laquo;') || link.label.includes('Previous')) {
          label = '';
          icon = <ChevronLeft className="h-4 w-4" />;
        } else if (link.label.includes('&raquo;') || link.label.includes('Next')) {
          label = '';
          icon = <ChevronRight className="h-4 w-4" />;
        } else {
          label = link.label;
        }

        if (link.url === null) {
          return (
            <Button
              key={key}
              variant="outline"
              size="icon"
              disabled
              className="h-8 w-8 text-slate-400 opacity-50 cursor-not-allowed"
            >
              {icon || <span dangerouslySetInnerHTML={{ __html: label }} />}
            </Button>
          );
        }

        return (
          <Button
            key={key}
            asChild
            variant={link.active ? "default" : "outline"}
            size={icon ? "icon" : "default"}
            className={`h-8 ${icon ? 'w-8' : 'px-3'} ${link.active ? 'bg-primary' : 'hover:bg-slate-100'}`}
          >
            <Link
              href={link.url}
              preserveState
              preserveScroll
            >
              {icon || <span dangerouslySetInnerHTML={{ __html: label }} />}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}