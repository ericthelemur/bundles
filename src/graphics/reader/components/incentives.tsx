import { Amount, Milestone, Milestones, Poll, Polls, Reward, Rewards, Target, Targets, Total } from "nodecg-tiltify/src/types/schemas";
import { useReplicant } from "use-nodecg";
import { dateFormat, formatAmount, timeFormat } from "../utils";
import Card from 'react-bootstrap/Card';
import { ProgressBar } from "./progress";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function start_date(date: string | null) {
    if (!date) return "";
    const start = new Date(date);
    const now = new Date(Date.now());
    if (now > start) return "";
    return "Starts " + timeFormat.format(start) + " " + dateFormat.format(start);
}

function end_date(date: string | null) {
    if (!date) return "";
    const end = new Date(date);
    const now = new Date(Date.now());
    const nextday = now.getTime() + (24 * 60 * 60 * 1000);
    if (nextday < end.getTime()) return "";
    return (now < end ? "Ends " : "Ended ") + timeFormat.format(end) + " " + dateFormat.format(end);
}

function dates(start: string | null, end: string | null) {
    const start_txt = start_date(start);
    if (start_txt) return start_txt;
    const end_txt = end_date(end);
    return end_txt;

}

function RewardCard({ reward }: { reward: Reward }) {
    var date_txt = dates(reward.starts_at || null, reward.ends_at || null);
    return (
        <Card className={(reward.quantity_remaining == 0 || (reward.ends_at && new Date(reward.ends_at).getTime() < Date.now())) ? "read" : ""}>
            <Card.Body>
                <details className="reward">
                    <summary>
                        <i className="bi bi-star-fill"></i>{" "}
                        {reward.name} for {formatAmount(reward.amount)}<br />
                        Raised {reward.amount_raised ? formatAmount(reward.amount_raised) : "£0"}
                        {reward.quantity_remaining && reward.quantity ? ` • ${reward.quantity_remaining}/${reward.quantity} remaining` : ""}
                        {date_txt ? (" • " + date_txt) : ""}
                    </summary>
                    {reward.description}
                </details>
            </Card.Body>
        </Card>
    )
}

function TargetCard({ target }: { target: Target }) {
    var date_txt = dates(null, target.ends_at || null);
    const label = `${formatAmount(target.amount_raised)} / ${formatAmount(target.amount)}`;
    return (
        <Card key={target.id}>
            <Card.Body>
                <div className="target">
                    <i className="bi bi-bullseye"></i>{" "}
                    {target.name} {label} <span className="text-body-tertiary">{date_txt}</span><br />
                    <ProgressBar label={label} value={Number(target.amount_raised.value)} maxVal={Number(target.amount.value)} />
                </div>
            </Card.Body>
        </Card>
    )
}


function findMilestones(ms: Milestone[] | undefined, total: Amount) {
    // Pick an index so it shows the last hit milestone and next two
    const milestones = ms ? [...ms] : [];
    if (milestones.length <= 3) return milestones;
    const threshold = Number(total.value);
    milestones.sort((a, b) => Number(a.amount.value) - Number(b.amount.value));
    const justHit = milestones.findIndex(m => Number(m.amount.value) > threshold);
    if (justHit === -1) return milestones.slice(milestones.length - 3, milestones.length);
    const i = Math.min(milestones.length - 3, Math.max(0, justHit - 1));
    return milestones.slice(i, i + 3);
}

function MilestoneCards({ milestones, total }: { milestones: Milestone[], total: Total }) {
    const [showAll, setShowAll] = useState(false);
    const mi = findMilestones(milestones, total);
    const content = <>{(showAll ? milestones : mi).map(m => <MilestoneCard milestone={m} total={total} />)}</>

    return <>
        <h2 className="mt-3">Milestones <Button className="px-1 py-0" variant="outline-secondary" onClick={() => setShowAll(!showAll)}><span className="small">Show {showAll ? "Less" : "All"}</span></Button></h2>
        <div className="donations">
            {content}
        </div>
    </>

}


function MilestoneCard({ milestone, total }: { milestone: Milestone, total: Total }) {
    const label = `${formatAmount(total)} / ${formatAmount(milestone.amount)}`;
    const hit = Number(total.value) >= Number(milestone.amount.value)
    return (
        <Card key={milestone.id}>
            <Card.Body>
                <div className={"milestone"}>
                    <h2 className={`h5 ${hit ? "text-success" : ""}`}>
                        <i className="bi bi-flag-fill"></i>{" "}
                        {milestone.name} {hit ? <Badge bg="success" className="small"> REACHED</Badge> : ""}<br />
                    </h2>
                    <ProgressBar label={label} value={Number(total.value)} maxVal={Number(milestone.amount.value)} />
                </div>
            </Card.Body>
        </Card>
    )
}

function PollCard({ poll }: { poll: Poll }) {
    return (
        <Card key={poll.id}>
            <Card.Body>
                <div className="poll">
                    <i className="bi bi-bar-chart-fill"></i>{" "}
                    {poll.name} <span className="text-body-tertiary">Total: {formatAmount(poll.amount_raised)}</span><br />
                    {poll.options.map(o => <ProgressBar key={o.name} className="mt-1" label={`${o.name} ${formatAmount(o.amount_raised)}`} value={Number(o.amount_raised.value)} maxVal={Number(poll.amount_raised.value)} />)}
                </div>
            </Card.Body>
        </Card>
    )
}


export function Incentives() {
    const [rewards, _] = useReplicant<Rewards>("rewards", [], { namespace: "nodecg-tiltify" });
    const [targets, _2] = useReplicant<Targets>("targets", [], { namespace: "nodecg-tiltify" });
    const [polls, _3] = useReplicant<Polls>("polls", [], { namespace: "nodecg-tiltify" });
    const [milestones, _4] = useReplicant<Milestones>("milestones", [], { namespace: "nodecg-tiltify" });
    const [total, _5] = useReplicant<Total>("total", { "currency": "GBP", "value": 0 }, { namespace: "nodecg-tiltify" });

    return (
        <>
            <h2 className="mt-3">Targets</h2>
            <div className="donations">
                {targets?.map(t => <TargetCard key={t.id} target={t} />)}
            </div>
            {milestones && total ? <MilestoneCards milestones={milestones} total={total} /> : ""}
            <h2 className="mt-3">Polls</h2>
            <div className="donations">
                {polls?.map(p => <PollCard key={p.id} poll={p} />)}
            </div>
            <h2>Rewards</h2>
            <div className="donations">
                {rewards?.map(r => <RewardCard key={r.id} reward={r} />)}
            </div>
        </>
    )
}