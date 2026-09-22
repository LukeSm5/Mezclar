import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const navigate = useNavigate();

  return (
    <main className="about">
      <div className="about__inner">
        <button className="about__back" type="button" onClick={() => navigate("/")}>
          &larr; Back
        </button>

        <h1 className="about__title">About Mezclar</h1>

        <p className="about__lede">
          Mezclar is a platform for large-group social games, built for rooms of
          30 to 500+ people at once — the energy of a party game night, at the
          scale of a packed room.
        </p>

        <section className="about__section">
          <h2 className="about__heading">The icebreaker, replaced</h2>
          <p>
            It&rsquo;s what a club, class, org, or professional meeting reaches for
            instead of &ldquo;go around the room and say your name and a fun
            fact.&rdquo; Same goal, without the dread.
          </p>
        </section>

        <section className="about__section">
          <h2 className="about__heading">No download, no accounts</h2>
          <p>
            Players join by entering a short game code. A host runs the show from
            one screen, and everyone else&rsquo;s phone becomes their personal
            controller. People can jump in even after a round has started.
          </p>
        </section>

        <section className="about__section">
          <h2 className="about__heading">The room, not the screen</h2>
          <p>
            Most party games turn into passive scrolling or default to trivia.
            Mezclar is built to do the opposite: the games are designed around
            conversation, persuasion, negotiation, prediction, teamwork, and
            social deduction between actual humans standing near each other. The
            phone is just the input device — the real game happens face to face.
          </p>
        </section>

        <p className="about__status">
          Early development. The real-time lobby and core multiplayer
          infrastructure are underway.
        </p>
      </div>
    </main>
  );
}
