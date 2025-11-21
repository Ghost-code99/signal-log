import { readFile } from 'fs/promises';
import { join } from 'path';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  category?: string;
}

// Parse changelog markdown into entries
function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  
  // Split by ## headers (version entries)
  const sections = content.split(/^##\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0].trim();
    
    // Match version and date: "v1.0 - January 21, 2025"
    const versionMatch = header.match(/^(v\d+\.\d+)\s*-\s*(.+)$/);
    if (!versionMatch) continue;

    const [, version, date] = versionMatch;
    
    // Find title (first ### heading, usually emoji + text)
    const titleMatch = section.match(/^###\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Get description (everything after the title line)
    let description = section;
    if (titleMatch) {
      const titleIndex = section.indexOf(titleMatch[0]);
      description = section.substring(titleIndex + titleMatch[0].length).trim();
    } else {
      // If no title, skip the header line
      description = lines.slice(1).join('\n').trim();
    }

    // Clean up description
    description = description
      .replace(/^---$/gm, '') // Remove separators
      .trim();

    entries.push({
      version,
      date: date.trim(),
      title: title || `${version} Release`,
      description,
      category: 'release',
    });
  }

  return entries;
}

async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  try {
    const filePath = join(process.cwd(), 'src', 'data', 'changelog.md');
    const content = await readFile(filePath, 'utf-8');
    return parseChangelog(content);
  } catch (error) {
    console.error('Error reading changelog:', error);
    return [];
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Component to render markdown content
function MarkdownContent({ content }: { content: string }) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, idx) => {
        const trimmed = paragraph.trim();
        
        // Handle headings
        if (trimmed.startsWith('####')) {
          const text = trimmed.replace(/^####\s+/, '');
          return (
            <h4 key={idx} className="text-lg font-semibold mt-6 mb-3 text-foreground">
              {text}
            </h4>
          );
        }
        
        // Handle lists
        if (trimmed.includes('\n-') || trimmed.startsWith('-')) {
          const items = trimmed.split('\n').filter(line => line.trim().startsWith('-'));
          return (
            <ul key={idx} className="list-disc ml-6 space-y-2 mb-4">
              {items.map((item, itemIdx) => {
                const itemText = item.replace(/^-\s+/, '');
                // Simple markdown parsing for bold and links
                const parts: (string | JSX.Element)[] = [];
                let lastIndex = 0;
                let key = 0;
                
                // Match **bold** and [link](url)
                const regex = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
                let match;
                
                while ((match = regex.exec(itemText)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(itemText.substring(lastIndex, match.index));
                  }
                  
                  if (match[0].startsWith('**')) {
                    const boldText = match[0].replace(/\*\*/g, '');
                    parts.push(<strong key={key++} className="font-semibold text-foreground">{boldText}</strong>);
                  } else if (match[0].startsWith('[')) {
                    const linkText = match[2];
                    const linkUrl = match[3];
                    parts.push(
                      <Link key={key++} href={linkUrl} className="text-primary hover:underline">
                        {linkText}
                      </Link>
                    );
                  }
                  
                  lastIndex = match.index + match[0].length;
                }
                
                if (lastIndex < itemText.length) {
                  parts.push(itemText.substring(lastIndex));
                }
                
                return <li key={itemIdx} className="text-muted-foreground">{parts.length > 0 ? parts : itemText}</li>;
              })}
            </ul>
          );
        }
        
        // Handle regular paragraphs
        if (trimmed) {
          // Simple markdown parsing
          const parts: (string | JSX.Element)[] = [];
          let lastIndex = 0;
          let key = 0;
          
          // Match **bold** and [link](url)
          const regex = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
          let match;
          
          while ((match = regex.exec(trimmed)) !== null) {
            if (match.index > lastIndex) {
              parts.push(trimmed.substring(lastIndex, match.index));
            }
            
            if (match[0].startsWith('**')) {
              const boldText = match[0].replace(/\*\*/g, '');
              parts.push(<strong key={key++} className="font-semibold text-foreground">{boldText}</strong>);
            } else if (match[0].startsWith('[')) {
              const linkText = match[2];
              const linkUrl = match[3];
              parts.push(
                <Link key={key++} href={linkUrl} className="text-primary hover:underline">
                  {linkText}
                </Link>
              );
            }
            
            lastIndex = match.index + match[0].length;
          }
          
          if (lastIndex < trimmed.length) {
            parts.push(trimmed.substring(lastIndex));
          }
          
          return (
            <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
              {parts.length > 0 ? parts : trimmed}
            </p>
          );
        }
        
        return null;
      })}
    </div>
  );
}

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Changelog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay up to date with the latest features, improvements, and fixes.
        </p>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-8">
        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No changelog entries yet.</p>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={entry.version} className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="default" className="text-sm font-semibold">
                      {entry.version}
                    </Badge>
                    {entry.category && (
                      <Badge variant="outline" className="text-xs">
                        {entry.category}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {entry.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={entry.date}>
                    {formatDate(entry.date)}
                  </time>
                </div>
              </div>

              <MarkdownContent content={entry.description} />
            </Card>
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <Card className="p-8 bg-muted/50">
          <h3 className="text-xl font-semibold mb-2">Want to stay updated?</h3>
          <p className="text-muted-foreground mb-6">
            Follow our changelog for the latest updates and improvements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">View Pricing</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
