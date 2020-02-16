const Logger = require('./Logger');
const logger = new Logger();
const pidusage = require('pidusage');
const os = require('os');

class Stats 
{
	constructor(rooms, workers) 
	{
    this.rooms = rooms;
    this.workers = workers;
    this.statsIntervalTime = 60; // sec
    this.saveStatsCount = 60 * 10;
    this.processResourcesUsage = [];
    this.producers = {};
	}

	async render() 
	{
    this.work();
		return {
      processResourcesUsage: this.processResourcesUsage,  
      producers: this.producers
    };
	}
  
	startWorker()
	{
		setInterval(() => 
		{
			try 
			{
        this.work();
        this.clean();
			}
			catch (err) 
			{
				logger.error(err);
			}
		}, this.statsIntervalTime * 1000);
	}
  
  work() {
    this.processServerInfo();
  }

  clean() {
    if (this.processResourcesUsage.length > this.saveStatsCount) {
      this.processResourcesUsage.splice(0,1)
      this.producers.splice(0,1)
    }
  }

  getWorkerProducers(worker) {
    const result = {
      rooms_count: 0,
      video_producers: 0,
      audio_producers: 0
    };
    worker._routers.forEach(router => {
      result.rooms_count++,
      router._producers.forEach(producer => {
        if (producer._data) {
          producer._data.kind == 'audio' ? result.audio_producers++ : result.video_producers++
        }
      })
    })
    return result;
  }

  async getMediasoupWorkersStats()
  {	
    const workersUsage = [];
    const producerStat = this.producers[(new Date).toString()] = {
      audio_producers: 0,
      video_producers: 0,
      total: 0
    }
    for (const w of this.workers)
    {
      const stats = await pidusage(w.pid);
      const producers = this.getWorkerProducers(w)

      producerStat.audio_producers += producers.audio_producers;
      producerStat.video_producers += producers.video_producers;
      producerStat.total += (producers.audio_producers + producers.video_producers);

      workersUsage.push({
        pid: w.pid,
        cpu: stats.cpu.toFixed(2),
        mem: stats.memory,
        mem_percent:((stats.memory)/os.totalmem()*100).toFixed(2),
        room_count: producers.rooms_count,
        audio_producers: producers.audio_producers,
        video_producers: producers.video_producers
      })
    }
    
    return workersUsage;
  }

	async processServerInfo() 
	{
    const main_process = await pidusage(process.pid)
    const workers = await this.getMediasoupWorkersStats()
    this.processResourcesUsage.push({
			date: new Date,
			workers,
			stats:{
				cpu:Math.round(main_process.cpu,2),
				mem:((main_process.memory)/os.totalmem()*100).toFixed(2)
			}
    })
	}
}

module.exports = Stats;