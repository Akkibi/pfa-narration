import "./style.css";

type ObjectPanelProps = {
    active: boolean;
}

export function ObjectPanel({ active }: ObjectPanelProps) {

    return (
        <div className={"object-panel " + (active && 'active')}>
            <div>
                Franchement, là j'dirai pas non à
                ptit verre. Mais faut que j'me
                tienne à carreau. Pas question
                d'retomber.
            </div>
        </div>
    )
}