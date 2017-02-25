import numpy as np
import matplotlib.pyplot as plt
plt.ion()

savings_rate = np.linspace(.01, 1., 1000)

rate_of_return = .04

time_years = np.log(1/savings_rate)/np.log(1+rate_of_return)

plt.plot(100.*savings_rate, time_years)

data = np.concatenate((100.*savings_rate[:, np.newaxis], time_years[:, np.newaxis]), axis=1)

np.savetxt('data.csv', data, fmt='%3.10f', delimiter=', ', newline='\n', header='Savings rate, Time to retire (years)')

savings_rates = [.01, .02, .03, .04, .05, .06, .07]
data_all = 100.*savings_rate[:, np.newaxis]
for rate_of_return in savings_rates:
    time_years = np.log(1/savings_rate)/np.log(1+rate_of_return)
    plt.plot(100.*savings_rate, time_years)
    
    data_all = np.concatenate((data_all, time_years[:, np.newaxis]), axis=1)
    
np.savetxt('data_all.csv', data_all, fmt='%3.10f', delimiter=', ', newline='\n', header='Savings rate, '+', '.join([str(int(r*100))+'%' for r in savings_rates]))
