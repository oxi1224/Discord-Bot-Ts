import { Task } from "#lib";
import { TimeInMs } from "#base";
import fetch, { Headers } from "node-fetch";
import 'dotenv/config';

export default class Stats extends Task {
  constructor() {
    super('stats', {
      interval: TimeInMs.Second * 60
    });
  }

  public override async execute() {
    if (this.client.enviroment === 'dev') return;
    const guild = await this.client.guilds.fetch('508779434929815554');
    const playerCountChannel = await guild.channels.fetch('989158296185368626');
    const memberCountChannel = await guild.channels.fetch('989158452800655410');
    const fansChannel = await guild.channels.fetch('989158585529401354');
    const playerCount = await this.getPlayerCount();
    const memberCount = guild.memberCount;
    const fansCount = await this.getFansCount() + memberCount;
    playerCountChannel?.setName(`Playing now: ${playerCount}`);
    memberCountChannel?.setName(`Members: ${memberCount}`);
    fansChannel?.setName(`Fans: ${fansCount}`);
  }

  private async getPlayerCount() {
    const placeIDs = ['3452652137', '2756861770', '4751054607', '3069857462', '3298359873', '2482834103', '2956075197', '9666739740'];
    const promises = placeIDs.map(id => fetch(`https://www.roblox.com/places/api-get-details?assetId=${id}`).then(async res => (await res.json() as {[key: string]: unknown})?.OnlineCount as number));
    const results = await Promise.all(promises);
    return results.reduce((curr, prev) => curr + prev, 0);
  }

  private async getFansCount() {
    const groupMembers = await (await fetch('https://groups.roblox.com/v1/groups/2851520')).json() as {[key: string]: unknown};
    const twitterFollowers = await (await fetch ('https://api.twitter.com/2/users/1057388018515038208?user.fields=public_metrics', { 
      method: 'GET',
      headers: new Headers({ 'Authorization': `Bearer ${process.env.TWITTER_BEARER}` }),
      redirect: 'follow'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })).json() as any;
    return (groupMembers.memberCount as number) + (twitterFollowers.data.public_metrics.followers_count as number);
  }
}