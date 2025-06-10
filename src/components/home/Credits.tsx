type CreditsProps = {
    setIsCredits: (status: boolean) => void;
};

const team = {
    designers: [
        {
            name: "Nathan Nicoleau",
            roles: [
                "Level Design",
                "Croquis des mondes et objets",
                "Texturing 2D",
                "Design des fond 2D",
                "Sound Design",
            ],
        },
        {
            name: "Anaïs Chenichene",
            roles: [
                "Scénario et parcours",
                "UX/UI Design",
                "Texturing 2D",
                "Design des fond 2D",
                "Sound Design",
            ],
        },
        {
            name: "Minh Duc",
            roles: ["Croquis des personnages", "Design des fond 2D", "Texturing 2D"],
        },
        {
            name: "Alix Vigneron",
            roles: ["Modélisation 3D", "Sound Design"],
        },
    ],
    developers: [
        {
            name: "Akira Valade",
            roles: ["Modélisation 3D", "Mécaniques de jeu", "Intégration", "Testing"],
        },
        {
            name: "Fabrizio Manetti",
            roles: ["Mécaniques de jeu", "Intégration", "Testing"],
        },
    ],
};

/* 
    TODO: Rajouter effet stylé
*/

export default function Credits({ setIsCredits }: CreditsProps) {
    return (
        <>
            <img src="/images/logo.png" alt="logo" className="logo" />
            <div
                style={{
                    flex: 1,
                    padding: "20px",
                    fontFamily: "sans-serif",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h1>Credits</h1>

                <section
                    style={{
                        padding: "10px 0",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center ",
                    }}
                >
                    <h3>Designers</h3>
                    {team.designers.map((member) => (
                        <div key={member.name} style={{ padding: "10px 0" }}>
                            <strong>{member.name}</strong>
                            <ul>
                                {member.roles.map((role, index) => (
                                    <li key={index}>{role}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <h3>Développeurs</h3>
                    {team.developers.map((member) => (
                        <div key={member.name} style={{ padding: "10px 0" }}>
                            <strong>{member.name}</strong>
                            <ul>
                                {member.roles.map((role, index) => (
                                    <li key={index}>{role}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <button
                    onClick={() => {
                        setIsCredits(false);
                    }}
                >
                    close credits
                </button>
            </div>
        </>
    );
}
