import { TopBar } from "@/components/ui/"

export default function Overview () {
      return (
            <div className='flex-1 flex flex-col min-h-screen'>
                  <TopBar
                        title="Overview"
                        subtitle="All-time performance snapshot"
                  />
                  
                  <main className="flex-1 p-6 space-y-6">

                  </main>

            </div>
      )
}