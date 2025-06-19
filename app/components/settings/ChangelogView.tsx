"use client";

import { changelogData, ChangelogItem } from "@/app/utils/changelogData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangelogView() {
  return (
    <div className="space-y-4">
      {changelogData.map((release, index) => (
        <Card key={index} className="bg-card border-border py-4 gap-0">
          <CardHeader className="pb-2 pt-0 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Version {release.version}</CardTitle>
              <span className="text-xs text-muted-foreground">{release.releaseDate}</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-0 pt-4 border-t border-border">
            {release.details && (
              <p className="text-sm mb-3 text-muted-foreground">{release.details}</p>
            )}
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Changes:</h4>
                <ul className="space-y-1">
                  {release.changes.map((change, idx) => (
                    <li key={idx} className="text-sm flex gap-2">
                      <span className="text-foreground">-</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {release.benefits && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Benefits:</h4>
                  <ul className="space-y-1">
                    {release.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <span className="text-foreground">+</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 