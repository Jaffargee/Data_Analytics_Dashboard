import { Card, Skeleton, SkeletonItem } from "@fluentui/react-components";

export default function SkeletonCard({ className }: { className?: string }) {
  return (
      <Card size="medium" appearance="subtle" className={className}>
            <Skeleton>
                  <SkeletonItem
                        shape="rectangle"
                        style={{ width: "100%", height: 180 }}
                  />

                  <SkeletonItem
                        shape="rectangle"
                        style={{ width: "70%", height: 24, marginTop: 16 }}
                  />

                  <SkeletonItem
                        shape="rectangle"
                        style={{ width: "100%", height: 16, marginTop: 12 }}
                  />

                  <SkeletonItem
                        shape="rectangle"
                        style={{ width: "90%", height: 16, marginTop: 8 }}
                  />
            </Skeleton>
      </Card>
  );
}