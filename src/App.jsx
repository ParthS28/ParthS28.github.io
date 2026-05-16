import Navbar from "./components/Navbar";
import TimelineSection from "./components/TimelineSection";
import PinballCanvas from "./game/PinballCanvas";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#121a35,_#05070f_62%)] text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto flex-1 px-6 py-10 sm:px-6 sm:py-16">
        <section id="game" className="scroll-mt-24">
        <PinballCanvas />
        </section>
        <br />
        <br />
        <section id="timeline" className="scroll-mt-24">
        <TimelineSection />
        </section>
      </main>
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default App;
