export class MetricRepository {
  async findById(id: string): Promise<{ id: string; name: string } | null> {
    return {
      id,
      name: `Metric ${id}`
    };
  }

  async getLatestValues(metricIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    for (const id of metricIds) {
      result.set(id, Math.floor(Math.random() * 1000) + 100);
    }
    return result;
  }
}

export const metricRepository = new MetricRepository();
